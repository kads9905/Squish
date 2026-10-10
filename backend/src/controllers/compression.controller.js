import fs from "fs";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFile } from "../utils/deleteFiles.js";
import { compressImage } from "../services/image.service.js";
import { compressVideo } from "../services/video.service.js";
import { MediaFile } from "../models/mediaFile.model.js";
import { IMAGE_FORMATS, VIDEO_PRESETS, VIDEO_RESOLUTIONS } from "../constants.js";


// Accepts the Mongo _id (preferred) or the stored upload filename (legacy clients)
const findOwnedMedia = async (fileId, userId) => {
  const query = mongoose.isValidObjectId(fileId)
    ? { _id: fileId }
    : { originalFilename: fileId };

  const mediaFile = await MediaFile.findOne({ ...query, user: userId });

  if (!mediaFile) {
    throw new ApiError(404, "Media file not found");
  }

  if (mediaFile.status === "processing") {
    throw new ApiError(409, "This file is already being processed");
  }

  if (!fs.existsSync(mediaFile.originalPath)) {
    throw new ApiError(410, "The original file is no longer available");
  }

  return mediaFile;
};

const getSavedPercentage = (originalSize, compressedSize) =>
  Number((((originalSize - compressedSize) / originalSize) * 100).toFixed(2));

// Clears any previous result so a re-compress starts from a clean slate
const resetCompressionFields = (mediaFile) => {
  if (mediaFile.compressedPath) {
    deleteFile(mediaFile.compressedPath);
  }

  mediaFile.compressedFilename = null;
  mediaFile.compressedPath = null;
  mediaFile.compressedSize = null;
  mediaFile.outputFormat = null;
  mediaFile.compressionPercentage = null;
  mediaFile.quality = null;
  mediaFile.preset = null;
  mediaFile.resize = null;
  mediaFile.errorMessage = null;
  mediaFile.progress = 0;
};


const compressImageController = asyncHandler(async (req, res) => {
  const { fileId, quality = 80, format = "webp", maxWidth = null } = req.body;

  if (!fileId) {
    throw new ApiError(400, "File ID is required");
  }

  const numericQuality = Number(quality);

  if (!Number.isInteger(numericQuality) || numericQuality < 1 || numericQuality > 100) {
    throw new ApiError(400, "Quality must be an integer between 1 and 100");
  }

  if (!IMAGE_FORMATS.includes(format)) {
    throw new ApiError(
      400,
      `Invalid image format. Allowed formats: ${IMAGE_FORMATS.join(", ")}`
    );
  }

  const numericMaxWidth = maxWidth === null || maxWidth === "" ? null : Number(maxWidth);

  if (
    numericMaxWidth !== null &&
    (!Number.isInteger(numericMaxWidth) || numericMaxWidth < 16 || numericMaxWidth > 10000)
  ) {
    throw new ApiError(400, "Max width must be an integer between 16 and 10000");
  }

  const mediaFile = await findOwnedMedia(fileId, req.user._id);

  if (mediaFile.fileType !== "image") {
    throw new ApiError(400, "Selected file is not an image");
  }

  resetCompressionFields(mediaFile);
  mediaFile.status = "processing";
  await mediaFile.save();

  let result;

  try {
    result = await compressImage(
      mediaFile.originalPath,
      numericQuality,
      format,
      numericMaxWidth
    );

    const compressedSize = fs.statSync(result.outputPath).size;

    mediaFile.compressedFilename = result.outputName;
    mediaFile.compressedPath = result.outputPath;
    mediaFile.compressedSize = compressedSize;
    mediaFile.outputFormat = format;
    mediaFile.compressionPercentage = getSavedPercentage(mediaFile.originalSize, compressedSize);
    mediaFile.quality = numericQuality;
    mediaFile.resize = numericMaxWidth ? String(numericMaxWidth) : null;
    mediaFile.width = result.width;
    mediaFile.height = result.height;
    mediaFile.progress = 100;
    mediaFile.status = "completed";

    await mediaFile.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        mediaFile,
        "Image compressed successfully"
      )
    );
  } catch (error) {
    if (result?.outputPath) {
      deleteFile(result.outputPath);
    }

    resetCompressionFields(mediaFile);
    mediaFile.status = "failed";
    mediaFile.errorMessage = "Image compression failed";
    await mediaFile.save();

    throw error;
  }
});


// Runs after the HTTP response has been sent; clients poll GET /api/files/:id
const runVideoJob = async (mediaFile, options) => {
  let lastSavedProgress = 0;

  try {
    const result = await compressVideo(mediaFile.originalPath, {
      ...options,
      onProgress: (percent) => {
        // Throttle DB writes to roughly every 5%
        if (percent - lastSavedProgress >= 5) {
          lastSavedProgress = percent;
          MediaFile.updateOne({ _id: mediaFile._id }, { progress: percent }).catch(() => {});
        }
      },
    });

    const compressedSize = fs.statSync(result.outputPath).size;

    mediaFile.compressedFilename = result.outputName;
    mediaFile.compressedPath = result.outputPath;
    mediaFile.compressedSize = compressedSize;
    mediaFile.outputFormat = "mp4";
    mediaFile.compressionPercentage = getSavedPercentage(mediaFile.originalSize, compressedSize);
    mediaFile.preset = options.preset;
    mediaFile.resize = options.resolution === "original" ? null : options.resolution;
    mediaFile.progress = 100;
    mediaFile.status = "completed";

    await mediaFile.save();
  } catch (error) {
    console.error(`Video compression failed for ${mediaFile._id}:`, error.message);

    if (error.outputPath) {
      deleteFile(error.outputPath);
    }

    try {
      resetCompressionFields(mediaFile);
      mediaFile.status = "failed";
      mediaFile.errorMessage = "Video compression failed";
      await mediaFile.save();
    } catch {
      // The record may have been deleted while encoding; nothing left to update
    }
  }
};


const compressVideoController = asyncHandler(async (req, res) => {
  const { fileId, preset = "balanced", resolution = "original", mute = false } = req.body;

  if (!fileId) {
    throw new ApiError(400, "File ID is required");
  }

  if (!VIDEO_PRESETS.includes(preset)) {
    throw new ApiError(
      400,
      `Invalid video preset. Allowed presets: ${VIDEO_PRESETS.join(", ")}`
    );
  }

  if (!VIDEO_RESOLUTIONS.includes(String(resolution))) {
    throw new ApiError(
      400,
      `Invalid resolution. Allowed values: ${VIDEO_RESOLUTIONS.join(", ")}`
    );
  }

  const mediaFile = await findOwnedMedia(fileId, req.user._id);

  if (mediaFile.fileType !== "video") {
    throw new ApiError(400, "Selected file is not a video");
  }

  resetCompressionFields(mediaFile);
  mediaFile.status = "processing";
  await mediaFile.save();

  runVideoJob(mediaFile, {
    preset,
    resolution: String(resolution),
    mute: Boolean(mute),
  });

  return res.status(202).json(
    new ApiResponse(
      202,
      mediaFile,
      "Video compression started"
    )
  );
});


export { compressImageController, compressVideoController };

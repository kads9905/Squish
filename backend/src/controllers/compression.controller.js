import fs from "fs";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { compressImage } from "../services/image.service.js";
import { compressVideo } from "../services/video.service.js";
import { MediaFile } from "../models/mediaFile.model.js";

const compressImageController = asyncHandler(async (req, res) => {
  const { fileId, quality = 80, format = "webp" } = req.body;

  if (!fileId) {
    throw new ApiError(400, "File ID is required");
  }

  const numericQuality = Number(quality);

  if (!Number.isInteger(numericQuality) || numericQuality < 1 || numericQuality > 100) {
    throw new ApiError(400, "Quality must be an integer between 1 and 100");
  }

  const allowedFormats = ["webp", "jpeg", "png"];

  if (!allowedFormats.includes(format)) {
    throw new ApiError(
      400,
      "Invalid image format. Allowed formats: webp, jpeg, png"
    );
  }

  const mediaFile = await MediaFile.findOne({
    originalFilename: fileId,
    user: req.user._id,
  });

  if (!mediaFile) {
    throw new ApiError(404, "Media file not found");
  }

  if (mediaFile.fileType !== "image") {
    throw new ApiError(400, "Selected file is not an image");
  }

  try {
    mediaFile.status = "processing";
    await mediaFile.save();

    const result = await compressImage(
      mediaFile.originalPath,
      numericQuality,
      format
    );

    const originalSize = fs.statSync(mediaFile.originalPath).size;
    const compressedSize = fs.statSync(result.outputPath).size;

    const savedPercentage = Number(
      (((originalSize - compressedSize) / originalSize) * 100).toFixed(2)
    );

    mediaFile.compressedFilename = result.outputName;
    mediaFile.compressedPath = result.outputPath;
    mediaFile.compressedSize = compressedSize;
    mediaFile.outputFormat = format;
    mediaFile.compressionPercentage = savedPercentage;
    mediaFile.quality = numericQuality;
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
      if (mediaFile.compressedPath && fs.existsSync(mediaFile.compressedPath)) {
        fs.unlinkSync(mediaFile.compressedPath);
      }

      mediaFile.compressedFilename = null;
      mediaFile.compressedPath = null;
      mediaFile.compressedSize = null;
      mediaFile.outputFormat = null;
      mediaFile.compressionPercentage = null;
      mediaFile.quality = null;
      mediaFile.status = "failed";

      await mediaFile.save();

      throw error;
    }
});


const compressVideoController = asyncHandler(async (req, res) => {
  const { fileId, preset = "balanced" } = req.body;

  if (!fileId) {
    throw new ApiError(400, "File ID is required");
  }

  const allowedPresets = ["small", "balanced", "high"];

  if (!allowedPresets.includes(preset)) {
    throw new ApiError(
      400,
      "Invalid video preset. Allowed presets: small, balanced, high"
    );
  }

  const mediaFile = await MediaFile.findOne({
    originalFilename: fileId,
    user: req.user._id,
  });

  if (!mediaFile) {
    throw new ApiError(404, "Media file not found");
  }

  if (mediaFile.fileType !== "video") {
    throw new ApiError(400, "Selected file is not a video");
  }
  
  try {
    mediaFile.status = "processing";
    await mediaFile.save();
  
    const result = await compressVideo(
      mediaFile.originalPath,
      preset
    );

    const originalSize = fs.statSync(mediaFile.originalPath).size;
    const compressedSize = fs.statSync(result.outputPath).size;

    const savedPercentage = Number(
      (((originalSize - compressedSize) / originalSize) * 100).toFixed(2)
    );

    mediaFile.compressedFilename = result.outputName;
    mediaFile.compressedPath = result.outputPath;
    mediaFile.compressedSize = compressedSize;
    mediaFile.outputFormat = "mp4";
    mediaFile.compressionPercentage = savedPercentage;
    mediaFile.preset = preset;
    mediaFile.status = "completed";

    await mediaFile.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        mediaFile,
        "Video compressed successfully"
      )
    );
  } catch (error) {
      if (mediaFile.compressedPath && fs.existsSync(mediaFile.compressedPath)) {
        fs.unlinkSync(mediaFile.compressedPath);
      }

      mediaFile.compressedFilename = null;
      mediaFile.compressedPath = null;
      mediaFile.compressedSize = null;
      mediaFile.outputFormat = null;
      mediaFile.compressionPercentage = null;
      mediaFile.preset = null;
      mediaFile.status = "failed";

      await mediaFile.save();

      throw error;
    }
});


export { compressImageController, compressVideoController };

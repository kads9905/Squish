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

  const mediaFile = await MediaFile.findOne({
    originalFilename: fileId,
    user: req.user._id,
  });

  if (!mediaFile) {
    throw new ApiError(404, "Media file not found");
  }

  const result = await compressImage(
    mediaFile.originalPath,
    Number(quality),
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
  mediaFile.quality = Number(quality);
  mediaFile.status = "completed";

  await mediaFile.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      mediaFile,
      "Image compressed successfully"
    )
  );
});


const compressVideoController = asyncHandler(async (req, res) => {
  const { fileId, preset = "balanced" } = req.body;

  if (!fileId) {
    throw new ApiError(400, "File ID is required");
  }

  const mediaFile = await MediaFile.findOne({
    originalFilename: fileId,
    user: req.user._id,
  });

  if (!mediaFile) {
    throw new ApiError(404, "Media file not found");
  }

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
});


export { compressImageController, compressVideoController };

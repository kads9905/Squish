import fs from "fs";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFile } from "../utils/deleteFiles.js";
import { MediaFile } from "../models/mediaFile.model.js";


const downloadFile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mediaFile = await MediaFile.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!mediaFile) {
    throw new ApiError(404, "Media file not found");
  }

  if (!mediaFile.compressedPath) {
    throw new ApiError(404, "Compressed file not found");
  }

  if (!fs.existsSync(mediaFile.compressedPath)) {
    throw new ApiError(404, "Compressed file not found");
  }

  return res.download(mediaFile.compressedPath);
});


const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mediaFile = await MediaFile.findOne({
    _id: id,
    user: req.user._id,
  });

  if (!mediaFile) {
    throw new ApiError(404, "Media file not found");
  }

  // Delete original file
  deleteFile(mediaFile.originalPath);

  // Delete compressed file if it exists
  if (mediaFile.compressedPath) {
    deleteFile(mediaFile.compressedPath);
  }

  // Delete database record
  await MediaFile.findByIdAndDelete(mediaFile._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Media file deleted successfully"
    )
  );
});


const getMediaHistory = asyncHandler(async (req, res) => {
  const mediaFiles = await MediaFile.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      mediaFiles,
      "Media history fetched successfully"
    )
  );
});


export { 
  downloadFile, 
  deleteMedia,
  getMediaHistory
};
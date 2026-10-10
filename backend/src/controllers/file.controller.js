import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFile } from "../utils/deleteFiles.js";
import { MediaFile } from "../models/mediaFile.model.js";


const findOwnedMedia = async (id, userId) => {
  const mediaFile = await MediaFile.findOne({
    _id: id,
    user: userId,
  });

  if (!mediaFile) {
    throw new ApiError(404, "Media file not found");
  }

  return mediaFile;
};

const removeMediaFromDisk = (mediaFile) => {
  deleteFile(mediaFile.originalPath);

  if (mediaFile.compressedPath) {
    deleteFile(mediaFile.compressedPath);
  }
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


const getMediaFile = asyncHandler(async (req, res) => {
  const mediaFile = await findOwnedMedia(req.params.id, req.user._id);

  return res.status(200).json(
    new ApiResponse(200, mediaFile, "Media file fetched successfully")
  );
});


// Streams the original or compressed file inline (used for previews / before-after compare)
const previewFile = asyncHandler(async (req, res) => {
  const { variant = "compressed" } = req.query;

  if (!["original", "compressed"].includes(variant)) {
    throw new ApiError(400, "Variant must be 'original' or 'compressed'");
  }

  const mediaFile = await findOwnedMedia(req.params.id, req.user._id);

  const filePath =
    variant === "original" ? mediaFile.originalPath : mediaFile.compressedPath;

  if (!filePath || !fs.existsSync(filePath)) {
    throw new ApiError(404, `${variant === "original" ? "Original" : "Compressed"} file not found`);
  }

  res.set("Cache-Control", "private, max-age=3600");

  // sendFile supports Range requests, so videos can be scrubbed
  return res.sendFile(path.resolve(filePath));
});


const downloadFile = asyncHandler(async (req, res) => {
  const mediaFile = await findOwnedMedia(req.params.id, req.user._id);

  if (!mediaFile.compressedPath || !fs.existsSync(mediaFile.compressedPath)) {
    throw new ApiError(404, "Compressed file not found");
  }

  // "holiday.jpg" -> "holiday-squished.webp"
  const baseName = path.parse(mediaFile.originalName).name;
  const downloadName = `${baseName}-squished.${mediaFile.outputFormat}`;

  return res.download(path.resolve(mediaFile.compressedPath), downloadName);
});


const deleteMedia = asyncHandler(async (req, res) => {
  const mediaFile = await findOwnedMedia(req.params.id, req.user._id);

  if (mediaFile.status === "processing") {
    throw new ApiError(409, "Wait for processing to finish before deleting this file");
  }

  removeMediaFromDisk(mediaFile);

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


// Body: { ids: [...] } to delete a selection, or { all: true } to clear the library
const deleteManyMedia = asyncHandler(async (req, res) => {
  const { ids, all = false } = req.body || {};

  if (!all && (!Array.isArray(ids) || ids.length === 0)) {
    throw new ApiError(400, "Provide a non-empty 'ids' array or set 'all' to true");
  }

  if (!all && !ids.every((id) => mongoose.isValidObjectId(id))) {
    throw new ApiError(400, "One or more ids are invalid");
  }

  const filter = {
    user: req.user._id,
    status: { $ne: "processing" },
    ...(all ? {} : { _id: { $in: ids } }),
  };

  const mediaFiles = await MediaFile.find(filter);

  mediaFiles.forEach(removeMediaFromDisk);

  const { deletedCount } = await MediaFile.deleteMany({
    _id: { $in: mediaFiles.map((file) => file._id) },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { deletedCount },
      `${deletedCount} file(s) deleted`
    )
  );
});


// Query: page, limit, type (image|video), status, search, sort (newest|oldest|largest|savings)
const getMediaHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const { type, status, search, sort = "newest" } = req.query;

  const filter = { user: req.user._id };

  if (type) {
    if (!["image", "video"].includes(type)) {
      throw new ApiError(400, "Type must be 'image' or 'video'");
    }
    filter.fileType = type;
  }

  if (status) {
    if (!["uploaded", "processing", "completed", "failed"].includes(status)) {
      throw new ApiError(400, "Invalid status filter");
    }
    filter.status = status;
  }

  if (search?.trim()) {
    filter.originalName = { $regex: escapeRegex(search.trim().slice(0, 100)), $options: "i" };
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    largest: { originalSize: -1 },
    savings: { compressionPercentage: -1 },
  };

  const [mediaFiles, total] = await Promise.all([
    MediaFile.find(filter)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    MediaFile.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        items: mediaFiles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
      "Media history fetched successfully"
    )
  );
});


const getMediaStats = asyncHandler(async (req, res) => {
  const [stats] = await MediaFile.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        images: { $sum: { $cond: [{ $eq: ["$fileType", "image"] }, 1, 0] } },
        videos: { $sum: { $cond: [{ $eq: ["$fileType", "video"] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        processing: { $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] } },
        // Only completed files contribute to size savings
        originalBytes: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$originalSize", 0] },
        },
        compressedBytes: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$compressedSize", 0] },
        },
        avgReduction: {
          $avg: { $cond: [{ $eq: ["$status", "completed"] }, "$compressionPercentage", null] },
        },
      },
    },
  ]);

  const result = stats || {
    totalFiles: 0,
    images: 0,
    videos: 0,
    completed: 0,
    failed: 0,
    processing: 0,
    originalBytes: 0,
    compressedBytes: 0,
    avgReduction: null,
  };

  delete result._id;
  result.bytesSaved = result.originalBytes - result.compressedBytes;
  result.avgReduction =
    result.avgReduction === null ? 0 : Number(result.avgReduction.toFixed(2));

  return res.status(200).json(
    new ApiResponse(200, result, "Media stats fetched successfully")
  );
});


export {
  getMediaFile,
  previewFile,
  downloadFile,
  deleteMedia,
  deleteManyMedia,
  getMediaHistory,
  getMediaStats
};

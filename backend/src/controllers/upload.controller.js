import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFile } from "../utils/deleteFiles.js";
import { getImageDimensions } from "../services/image.service.js";
import { MediaFile } from "../models/mediaFile.model.js";

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const isImage = req.file.mimetype.startsWith("image/");
  const fileType = isImage ? "image" : "video";

  const originalFormat = req.file.mimetype.split("/")[1];

  const { width, height } = isImage
    ? await getImageDimensions(req.file.path)
    : { width: null, height: null };

  let mediaFile;

  try {
    mediaFile = await MediaFile.create({
      user: req.user._id,

      originalName: req.file.originalname,
      originalFilename: req.file.filename,
      originalPath: req.file.path,
      originalSize: req.file.size,

      fileType,
      originalFormat,
      width,
      height,

      status: "uploaded",
    });
  } catch (error) {
    // Don't leave an orphaned upload on disk
    deleteFile(req.file.path);
    throw error;
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      mediaFile,
      "File uploaded successfully"
    )
  );
});

export { uploadFile };

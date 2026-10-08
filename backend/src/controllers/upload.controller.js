import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { MediaFile } from "../models/mediaFile.model.js";

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const isImage = req.file.mimetype.startsWith("image/");
  const fileType = isImage ? "image" : "video";

  const originalFormat = req.file.mimetype.split("/")[1];

  const mediaFile = await MediaFile.create({
    user: req.user._id,

    originalName: req.file.originalname,
    originalFilename: req.file.filename,
    originalPath: req.file.path,
    originalSize: req.file.size,

    fileType,
    originalFormat,

    status: "uploaded",
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      mediaFile,
      "File uploaded successfully"
    )
  );
});

export { uploadFile };
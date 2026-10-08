import mongoose, { Schema } from "mongoose";

const mediaFileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    originalFilename: {
      type: String,
      required: true,
    },

    originalPath: {
      type: String,
      required: true,
    },

    originalSize: {
      type: Number,
      required: true,
    },

    fileType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    originalFormat: {
      type: String,
      required: true,
    },

    compressedFilename: {
      type: String,
      default: null,
    },

    compressedPath: {
      type: String,
      default: null,
    },

    compressedSize: {
      type: Number,
      default: null,
    },

    outputFormat: {
      type: String,
      default: null,
    },

    compressionPercentage: {
      type: Number,
      default: null,
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "completed", "failed"],
      default: "uploaded",
    },

    quality: {
      type: Number,
      default: null,
    },

    preset: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const MediaFile = mongoose.model("MediaFile", mediaFileSchema);
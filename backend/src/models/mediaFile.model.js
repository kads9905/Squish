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

    // Max width for images, target height (e.g. "720") for videos
    resize: {
      type: String,
      default: null,
    },

    // 0-100, updated while a video encode is running
    progress: {
      type: Number,
      default: 0,
    },

    errorMessage: {
      type: String,
      default: null,
    },

    width: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

mediaFileSchema.index({ user: 1, createdAt: -1 });

// Never leak absolute/relative server paths to clients
mediaFileSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.originalPath;
    delete ret.compressedPath;
    delete ret.__v;
    return ret;
  },
});

export const MediaFile = mongoose.model("MediaFile", mediaFileSchema);
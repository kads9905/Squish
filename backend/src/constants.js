import path from "path";

export const DB_NAME = "mediaforge";

export const UPLOAD_DIR = path.join("uploads", "originals");
export const PROCESSED_DIR = path.join("uploads", "processed");

export const IMAGE_FORMATS = ["webp", "avif", "jpeg", "png"];
export const VIDEO_PRESETS = ["small", "balanced", "high"];
export const VIDEO_RESOLUTIONS = ["original", "1080", "720", "480"];

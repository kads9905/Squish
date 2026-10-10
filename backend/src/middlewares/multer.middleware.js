import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { UPLOAD_DIR } from "../constants.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
];

// Some clients send a generic mimetype (e.g. .mkv/.mov on Windows), so fall back to the extension
const mimeByExtension = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".mkv": "video/x-matroska",
};

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    const guessed = mimeByExtension[path.extname(file.originalname).toLowerCase()];

    if (["application/octet-stream", ""].includes(file.mimetype) && guessed) {
      file.mimetype = guessed;
    }
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Unsupported file type"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
});
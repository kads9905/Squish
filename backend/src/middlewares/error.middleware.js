import multer from "multer";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const sendError = (res, statusCode, message, errors = []) =>
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    data: null,
  });

const notFoundHandler = (req, res) =>
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);

const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return sendError(
      res,
      400,
      err.code === "LIMIT_FILE_SIZE"
        ? "File exceeds the 500 MB upload limit"
        : err.message
    );
  }

  // Malformed ObjectId in params / body
  if (err instanceof mongoose.Error.CastError) {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, errors[0] || "Validation failed", errors);
  }

  // Duplicate key (unique index)
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return sendError(res, 409, `That ${field} is already taken`);
  }

  if (err instanceof jwt.TokenExpiredError) {
    return sendError(res, 401, "Token expired");
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return sendError(res, 401, "Invalid token");
  }

  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  return sendError(
    res,
    statusCode,
    statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error",
    err.errors || []
  );
};

export { errorHandler, notFoundHandler };

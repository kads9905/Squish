import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

// CORS_ORIGIN can be a comma separated list. Cookies require an explicit origin,
// so "*" is mapped to "reflect the request origin".
const corsOrigin =
  !process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === "*"
    ? true
    : process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

// Global middleware
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

// Throttle auth endpoints to slow down credential stuffing.
// Only failed attempts count, so people who log in and out a lot never get locked out.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later", errors: [], data: null },
});


// routes
import healthRouter from "./routes/health.routes.js";

app.use("/api/health", healthRouter);

import uploadRouter from "./routes/upload.routes.js";

app.use("/api/files", uploadRouter);

import compressionRouter from "./routes/compression.routes.js";

app.use("/api/compress", compressionRouter);

import fileRouter from "./routes/file.routes.js";

app.use("/api/files", fileRouter);

import userRouter from "./routes/user.routes.js";

app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/users", userRouter);


// unknown routes + global error middleware
app.use("/api", notFoundHandler);
app.use(errorHandler);


export default app;

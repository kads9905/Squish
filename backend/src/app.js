import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());


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

app.use("/api/users", userRouter);


// global error middleware
app.use(errorHandler);


export default app;
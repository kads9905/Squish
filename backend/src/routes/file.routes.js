import { Router } from "express";
import {
    getMediaFile,
    previewFile,
    downloadFile,
    deleteMedia,
    deleteManyMedia,
    getMediaHistory,
    getMediaStats
} from "../controllers/file.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/history", getMediaHistory);

router.get("/stats", getMediaStats);

router.get("/download/:id", downloadFile);

router.get("/:id/preview", previewFile);

router.post("/bulk-delete", deleteManyMedia);

router.get("/:id", getMediaFile);

router.delete("/:id", deleteMedia);


export default router;

import { Router } from "express";
import { 
    downloadFile,
    deleteMedia,
    getMediaHistory
} from "../controllers/file.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/history", verifyJWT, getMediaHistory);

router.get("/download/:id", verifyJWT, downloadFile);

router.delete("/:id", verifyJWT, deleteMedia);


export default router;
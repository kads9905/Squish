import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadFile } from "../controllers/upload.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/upload", 
    verifyJWT,
    upload.single("media"), 
    uploadFile
);

export default router;
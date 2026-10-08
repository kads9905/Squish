import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { 
    compressImageController,
    compressVideoController
} from "../controllers/compression.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/image",
    verifyJWT,
    compressImageController
);

router.post(
    "/video",
    verifyJWT,
    compressVideoController
);

export default router;
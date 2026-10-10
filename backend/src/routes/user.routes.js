import { Router } from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser,
    refreshAccessToken,
    logoutUser,
    updateAccountDetails,
    changeCurrentPassword,
    deleteAccount
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/me", verifyJWT, getCurrentUser);

router.patch("/me", verifyJWT, updateAccountDetails);

router.delete("/me", verifyJWT, deleteAccount);

router.post("/change-password", verifyJWT, changeCurrentPassword);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", verifyJWT, logoutUser);

export default router;

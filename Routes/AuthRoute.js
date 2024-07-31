import express from "express";
import {
  onChangeRole,
  onEditProfile,
  onEditUserData,
  onFetchAll,
  onFetchProfile,
  onLogin,
  onP,
  onUserRegister,
  onVerificationOtp,
  sendOtp,
} from "../Controllers/AuthControllers.js";
import upload from "../Middlewares/fileUpload.js";
import { authenticateToken } from "../Middlewares/AuthMiddleware.js";
import { CheckingUser } from "../Middlewares/CheckingUser.js";

const router = express.Router();

router.post("/send-otp", sendOtp);

router.post("/verify-otp", onVerificationOtp);

router.post("/register", upload.single("authenticationImage"), onUserRegister);

router.get("/profile", authenticateToken, CheckingUser, onFetchProfile);

router.patch("/change-role", authenticateToken, CheckingUser, onChangeRole);

router.patch(
  "/edit-profile",
  authenticateToken,
  CheckingUser,
  upload.single("profilePic"),
  onEditProfile
);

router.patch(
  "/edit-user-data",
  authenticateToken,
  CheckingUser,
  onEditUserData
);

//
router.post("/login", onLogin);

router.get("/p/:mobile", onP);

router.get("/all", onFetchAll);

export default router;

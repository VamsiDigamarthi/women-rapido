import express from "express";
import {
  onAadharCardVerification,
  onChangeRole,
  onEditProfile,
  onEditUserData,
  onFetchAll,
  onFetchCities,
  onFetchProfile,
  onLicenseCardVerification,
  onLogin,
  onP,
  onPanCardVerification,
  onRCCardVerification,
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

// card verification apis

router.patch(
  "/aadhar-card-verification",
  authenticateToken,
  CheckingUser,
  onAadharCardVerification
);

router.patch(
  "/pan-card-verification",
  authenticateToken,
  CheckingUser,
  onPanCardVerification
);

router.patch(
  "/rc-card-verification",
  authenticateToken,
  CheckingUser,
  onRCCardVerification
);

router.patch(
  "/license-card-verification",
  authenticateToken,
  CheckingUser,
  onLicenseCardVerification
);

router.get("/cities", authenticateToken, CheckingUser, onFetchCities);

export default router;

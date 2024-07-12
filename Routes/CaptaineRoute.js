import express from "express";
import { authenticateToken } from "../Middlewares/AuthMiddleware.js";
import {
  onAcceptOrder,
  onCaptaineGiveRatingToRide,
  onDuttyChange,
  onFetchAllCompletedOrders,
  onFetchAllOrders,
  onOrderCompleted,
  onOrdersDeclaine,
  onUploadSecuritiesImages,
} from "../Controllers/CaptaineController.js";
import { CheckingUser } from "../Middlewares/CheckingUser.js";
import { ensureCaptainRole } from "../Middlewares/CaptaineMiddleware.js";
import upload from "../Middlewares/fileUpload.js";

const router = express.Router();

router.patch(
  "/change-dutty",
  authenticateToken,
  CheckingUser,
  ensureCaptainRole,
  upload.single("captainLiveImage"),
  onDuttyChange
);

router.get(
  "/orders/:longitude/:latitude/:distance/:currentData",
  authenticateToken,
  CheckingUser,
  ensureCaptainRole,
  onFetchAllOrders
);

router.patch(
  "/accept-order/:orderId",
  authenticateToken,
  CheckingUser,
  ensureCaptainRole,
  onAcceptOrder
);

router.patch(
  "/orders-rejected/:orderId",
  authenticateToken,
  CheckingUser,
  ensureCaptainRole,
  onOrdersDeclaine
);

router.patch(
  "/order-completed/:orderId",
  authenticateToken,
  CheckingUser,
  ensureCaptainRole,
  onOrderCompleted
);

router.get(
  "/completed-all-orders",
  authenticateToken,
  CheckingUser,
  ensureCaptainRole,
  onFetchAllCompletedOrders
);

router.patch(
  "/upload-security-image",
  authenticateToken,
  CheckingUser,
  // ensureCaptainRole,
  upload.fields([
    { name: "license", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "adhar", maxCount: 1 },
    { name: "rc", maxCount: 1 },
    { name: "authenticationImage", maxCount: 1 },
  ]),
  onUploadSecuritiesImages
);

router.patch(
  "/rating-by-captain/:orderId",
  authenticateToken,
  CheckingUser,
  ensureCaptainRole,
  onCaptaineGiveRatingToRide
);

export default router;

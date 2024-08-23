import express from "express";
import { authenticateToken } from "../Middlewares/AuthMiddleware.js";

import { CheckingUser } from "../Middlewares/CheckingUser.js";
import {
  OnShowStatusOfOrder,
  onAddFavoriteOrder,
  onAddFeedBack,
  onAddSavedOrder,
  onCancelOrder,
  onFetchAllFaviouriteOrder,
  onFetchAllOrders,
  onFetchCompletedOrder,
  onFetchOffersBanners,
  onPlaceOrder,
  onRePlaceOrder,
  onSavedOrdersFetch,
  onWriteReviews,
} from "../Controllers/UserControllers.js";
import { ensureUserRole } from "../Middlewares/UserMiddleware.js";
import upload from "../Middlewares/fileUpload.js";

const router = express.Router();

router.post(
  "/placed-order",
  authenticateToken,
  CheckingUser,
  upload.single("userAuthenticationImage"),
  onPlaceOrder
);

router.get(
  "/order-status/:orderId",
  authenticateToken,
  CheckingUser,
  ensureUserRole,
  OnShowStatusOfOrder
);

router.get("/all-order", authenticateToken, CheckingUser, onFetchAllOrders);

// router.get(
//   "/rejecte-orders/:currentDate",
//   authenticateToken,
//   CheckingUser,
//   ensureUserRole,
//   onFetchRejectedOrders
// );

router.patch(
  "/re-place-order/:orderId",
  authenticateToken,
  CheckingUser,
  ensureUserRole,
  onRePlaceOrder
);

router.patch(
  "/favourite/:orderId",
  authenticateToken,
  CheckingUser,
  ensureUserRole,
  onAddFavoriteOrder
);

router.patch(
  "/saved/:orderId",
  authenticateToken,
  CheckingUser,
  ensureUserRole,
  onAddSavedOrder
);

router.get(
  "/favourite-orders",
  authenticateToken,
  CheckingUser,
  ensureUserRole,
  onFetchAllFaviouriteOrder
);

router.get(
  "/saved-orders",
  authenticateToken,
  CheckingUser,
  ensureUserRole,
  onSavedOrdersFetch
);

// feed back
router.post(
  "feedback",
  authenticateToken,
  CheckingUser,
  ensureUserRole,
  onAddFeedBack
);

// 03-07-2024

router.get(
  "/completed-order/:orderId",
  authenticateToken,
  CheckingUser,
  ensureUserRole,
  onFetchCompletedOrder
);

router.patch(
  "/review-order/:orderId",
  authenticateToken,
  CheckingUser,
  ensureUserRole,
  onWriteReviews
);

// cancel orders
router.patch(
  "/cancel-order/:orderId",
  authenticateToken,
  CheckingUser,
  onCancelOrder
);

router.get(
  "/banners-offers",
  authenticateToken,
  CheckingUser,
  ensureUserRole,
  onFetchOffersBanners
);

export default router;

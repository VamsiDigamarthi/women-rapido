import express from "express";
import { authenticateToken } from "../Middlewares/AuthMiddleware.js";
import {
  onAcceptOrder,
  onCaptaineGiveRatingToRide,
  onCaptainLocationTracking,
  onDuttyChange,
  onFetchAllCompletedOrders,
  onFetchAllOrders,
  onIsRideStartNaviage,
  onOrderCompleted,
  onOrdersDeclaine,
  onUploadSecuritiesImages,
} from "../Controllers/CaptaineController.js";
import { CheckingUser } from "../Middlewares/CheckingUser.js";
import { ensureCaptainRole } from "../Middlewares/CaptaineMiddleware.js";
import upload from "../Middlewares/fileUpload.js";
import UserModel from "../Modals/UserModal.js";
import OrderModel from "../Modals/OrderModal.js";

const router = express.Router();

router.patch(
  "/change-dutty",
  authenticateToken,
  CheckingUser,
  ensureCaptainRole,
  upload.single("captainLiveImage"),
  onDuttyChange
);

// router.get(
//   "/orders/:longitude/:latitude/:distance/:currentData",
//   authenticateToken,
//   CheckingUser,
//   ensureCaptainRole,
//   onFetchAllOrders
// );

router.get(
  "/orders/:longitude/:latitude/:distance/:currentData",
  authenticateToken,
  // CheckingUser,
  async (req, res) => {
    const { mobile } = req;
    const existingUser = await UserModel.findOne({ mobile });
    console.log("onFetchAllOrders");
    try {
      const { longitude, latitude, distance, currentData } = req.params;
      let meters = parseInt(distance) * 1000;

      const orders = await OrderModel.find({
        pickup: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: meters,
            $minDistance: 0,
          },
        },
        orderPlaceDate: currentData,
        status: "pending",
        rejectedCaptaine: { $nin: [existingUser._id] },
        // status: { $in: ["pending", "rejected"] },
      });
      console.log(orders);

      return res.status(200).json(orders);
    } catch (error) {
      console.error("All orders Faield", error);
      return res
        .status(500)
        .json({ message: "All Orders Faield", error: error.message });
    }
  }
);

router.patch(
  "/accept-order/:orderId",
  authenticateToken,
  CheckingUser,
  ensureCaptainRole,
  onAcceptOrder
);

router.patch(
  "/isridestart-naviage/:orderId",
  authenticateToken,
  CheckingUser,
  ensureCaptainRole,
  onIsRideStartNaviage
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

router.patch(
  "/location-tracking",
  authenticateToken,
  CheckingUser,
  ensureCaptainRole,
  onCaptainLocationTracking
);

export default router;

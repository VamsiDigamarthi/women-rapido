import express from "express";
import { authenticateToken } from "../Middlewares/AuthMiddleware.js";

import { CheckingUser } from "../Middlewares/CheckingUser.js";
import { ensureDeveloperRole } from "../Middlewares/DeveloperMiddleware.js";
import {
  onAddCities,
  onDeleteAllOrders,
  onDeleteOneCaptaine,
  onDeleteUser,
  onFetchAllBanners,
  onHoldingCaptain,
  onPostBanners,
  onPostBannersOffer,
} from "../Controllers/DeveloperController.js";
import upload from "../Middlewares/fileUpload.js";

const router = express.Router();

router.post(
  "/baners",
  authenticateToken,
  CheckingUser,
  ensureDeveloperRole,
  upload.single("bannerImage"),
  onPostBanners
);

router.post(
  "/banners-offers",
  authenticateToken,
  CheckingUser,
  ensureDeveloperRole,
  upload.single("bannerImage"),
  onPostBannersOffer
);

router.get("/baners", authenticateToken, CheckingUser, onFetchAllBanners);

router.delete(
  "/orders",
  authenticateToken,
  CheckingUser,
  ensureDeveloperRole,
  onDeleteAllOrders
);

router.delete(
  "/delete-one-captaine/:captainId",
  authenticateToken,
  CheckingUser,
  ensureDeveloperRole,
  onDeleteOneCaptaine
);

router.patch(
  "/holding-captain/:captanId",
  authenticateToken,
  CheckingUser,
  ensureDeveloperRole,
  onHoldingCaptain
);

router.patch("/delete-user", onDeleteUser);

// add cities

router.post(
  "/add-cities",
  authenticateToken,
  CheckingUser,
  ensureDeveloperRole,
  onAddCities
);

export default router;

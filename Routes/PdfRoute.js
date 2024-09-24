import express from "express";

import { authenticateToken } from "../Middlewares/AuthMiddleware.js";
import { CheckingUser } from "../Middlewares/CheckingUser.js";
import { onGetPDF } from "../Controllers/PdfControllers.js";

const router = express.Router();

router.get("/:mobile", onGetPDF);



export default router;

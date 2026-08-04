import { Router } from "express";
import { SigningController } from "./signing.controller";
import { authenticateUser } from "../../middlewares/auth";
import { signingRateLimiter } from "../../middlewares/rateLimit";

const router = Router();

router.use(authenticateUser);
router.use(signingRateLimiter);

router.post("/upload", SigningController.getUploadUrl);
router.post("/download", SigningController.getDownloadUrl);

export default router;

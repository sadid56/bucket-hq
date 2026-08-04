import { Router } from "express";
import { AuditController } from "./audit.controller";
import { authenticateUser, requireAdmin } from "../../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", AuditController.getLogs);
router.get("/stats", requireAdmin, AuditController.getStats);

export default router;

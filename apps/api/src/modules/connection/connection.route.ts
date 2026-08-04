import { Router } from "express";
import { ConnectionController } from "./connection.controller";
import { authenticateUser, requireOrgRole } from "../../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.post("/", requireOrgRole(["OWNER", "EDITOR"]), ConnectionController.create);
router.get("/", requireOrgRole(["OWNER", "EDITOR", "VIEWER"]), ConnectionController.list);
router.put("/:connectionId", requireOrgRole(["OWNER", "EDITOR"]), ConnectionController.update);
router.delete("/:connectionId", requireOrgRole(["OWNER"]), ConnectionController.delete);

export default router;

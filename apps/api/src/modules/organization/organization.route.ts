import { Router } from "express";
import { OrganizationController } from "./organization.controller";
import { authenticateUser, requireOrgRole } from "../../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.post("/", OrganizationController.create);
router.get("/", OrganizationController.list);

router.put("/:orgId", requireOrgRole(["OWNER"]), OrganizationController.update);
router.delete("/:orgId", requireOrgRole(["OWNER"]), OrganizationController.delete);

export default router;

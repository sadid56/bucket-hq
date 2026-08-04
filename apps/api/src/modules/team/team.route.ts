import { Router } from "express";
import { TeamController } from "./team.controller";
import { authenticateUser, requireOrgRole } from "../../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", requireOrgRole(["OWNER", "EDITOR", "VIEWER"]), TeamController.listMembers);

router.post("/invite", requireOrgRole(["OWNER"]), TeamController.inviteMember);
router.put("/:userId/role", requireOrgRole(["OWNER"]), TeamController.updateMemberRole);
router.delete("/:userId", requireOrgRole(["OWNER"]), TeamController.removeMember);

router.get(
  "/restrictions/:userId/:connectionId",
  requireOrgRole(["OWNER", "EDITOR", "VIEWER"]),
  TeamController.listPathRestrictions
);
router.post("/restrictions/:userId", requireOrgRole(["OWNER"]), TeamController.addPathRestriction);
router.delete(
  "/restrictions/:restrictionId",
  requireOrgRole(["OWNER"]),
  TeamController.removePathRestriction
);

export default router;

import { Router } from "express";
import { UserController } from "./user.controller";
import { authenticateUser, requireAdmin } from "../../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/me", UserController.getMe);

router.use(requireAdmin);
router.get("/", UserController.getUsers);
router.patch("/:userId/ban", UserController.toggleBan);
router.patch("/:userId/role", UserController.updateRole);

export default router;

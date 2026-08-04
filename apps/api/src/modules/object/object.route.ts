import { Router } from "express";
import { ObjectController } from "./object.controller";
import { authenticateUser } from "../../middlewares/auth";

const router = Router();

router.use(authenticateUser);

router.get("/", ObjectController.listObjects);
router.delete("/", ObjectController.deleteObject);

export default router;

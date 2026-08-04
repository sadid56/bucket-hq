import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

import userRouter from "./modules/user/user.route";
import orgRouter from "./modules/organization/organization.route";
import connectionRouter from "./modules/connection/connection.route";
import signingRouter from "./modules/signing/signing.route";
import objectRouter from "./modules/object/object.route";
import teamRouter from "./modules/team/team.route";
import auditRouter from "./modules/audit/audit.route";

import { apiLogger, notFound, globalErrorHandler } from "@middlewares";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(apiLogger);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests from this IP. Please try again later.",
  },
});
app.use("/api", limiter);

app.use("/api/users", userRouter);
app.use("/api/organizations", orgRouter);
app.use("/api/connections", connectionRouter);
app.use("/api/signing", signingRouter);
app.use("/api/objects", objectRouter);
app.use("/api/team", teamRouter);
app.use("/api/audits", auditRouter);

app.get("/health", (req, res) => {
  res.status(StatusCodes.OK).json({ status: "OK", timestamp: new Date() });
});

app.use(notFound);

app.use(globalErrorHandler);

export default app;

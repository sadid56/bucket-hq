import { ErrorRequestHandler } from "express";
import chalk from "chalk";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import { AppError } from "@utils";

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const timestamp = chalk.gray(new Date().toLocaleTimeString());

  if (err instanceof ZodError) {
    console.warn(
      `[${timestamp}] ${chalk.yellow.bold("⚠️  [Validation Error]")} ${req.method} ${req.originalUrl} - ${err.errors.length} fields failed validation`
    );
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: "fail",
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof AppError) {
    console.warn(
      `[${timestamp}] ${chalk.yellow.bold(`⚠️  [${err.statusCode} AppError]`)} ${req.method} ${req.originalUrl} - ${err.message}`
    );
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error(
    `[${timestamp}] ${chalk.red.bold("💥 [Internal Error]")} ${req.method} ${req.originalUrl} - ${err.message || err}`
  );
  if (err.stack) {
    console.error(chalk.gray(err.stack));
  }

  const isDev = process.env.NODE_ENV === "development";
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: isDev ? err.message || "Internal Server Error" : "Something went wrong. Please try again later.",
    ...(isDev && { stack: err.stack }),
  });
};
export default globalErrorHandler;

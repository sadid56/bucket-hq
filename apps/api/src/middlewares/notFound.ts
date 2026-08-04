import { Request, Response } from "express";
import chalk from "chalk";
import { StatusCodes } from "http-status-codes";

export const notFound = (req: Request, res: Response) => {
  const timestamp = chalk.gray(new Date().toLocaleTimeString());
  console.warn(
    `[${timestamp}] ${chalk.yellow.bold("⚠️  [404]")} ${req.method} ${req.originalUrl} - Route Not Found`
  );

  res.status(StatusCodes.NOT_FOUND).json({
    message: "Route not found",
    path: req.originalUrl,
    date: new Date(),
  });
};
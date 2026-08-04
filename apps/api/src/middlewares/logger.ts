import { Request, Response, NextFunction } from "express";
import chalk from "chalk";

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    let methodColor = chalk.white;
    switch (method) {
      case "GET":
        methodColor = chalk.green;
        break;
      case "POST":
        methodColor = chalk.yellow;
        break;
      case "PUT":
      case "PATCH":
        methodColor = chalk.blue;
        break;
      case "DELETE":
        methodColor = chalk.red;
        break;
    }

    let statusColor = chalk.white;
    if (statusCode >= 500) {
      statusColor = chalk.red;
    } else if (statusCode >= 400) {
      statusColor = chalk.yellow;
    } else if (statusCode >= 300) {
      statusColor = chalk.cyan;
    } else if (statusCode >= 200) {
      statusColor = chalk.green;
    }

    const timestamp = new Date().toLocaleTimeString();
    console.log(
      `[${chalk.gray(timestamp)}] ${methodColor(method.padEnd(7))} ${originalUrl} - ${statusColor(statusCode)} - ${chalk.gray(`${duration}ms`)}`
    );
  });

  next();
};

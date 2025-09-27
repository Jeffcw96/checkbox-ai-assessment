import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { isJSON } from "../utils/isJSON";

function generateErrorMessage(err: Error) {
  if (err.message) {
    if (isJSON(err.message)) {
      return JSON.parse(err.message);
    }
    return err.message;
  } else if (typeof err === "string") {
    return err;
  } else {
    return JSON.stringify(err);
  }
}

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  const message = generateErrorMessage(err);
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({ ...err, message });
  }

  return res.status(500).json(message);
}

export { errorHandler };

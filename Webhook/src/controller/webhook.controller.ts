import axios from "axios";
import { Request, Response } from "express";
import {
  validateEvent,
  validateSchemaPayload,
} from "../service/webhook.service";
import { AppError } from "../utils/appError";

export const postBackendAPIForTesting = async (
  _req: Request,
  res: Response
) => {
  await axios.get(`${process.env.BACKEND_API_URL}/user`, { timeout: 3000 });
  res.status(200).json("OK");
};

export const handleWebhookEvent = async (req: Request, res: Response) => {
  if (!req.body || typeof req.body !== "object") {
    throw AppError.badRequest("Request body must be a JSON object");
  }

  const { event } = req.body as { event: string };

  const validatedEvent = validateEvent(event);

  if (!validatedEvent.isValid) {
    throw AppError.badRequest(validatedEvent.error);
  }

  const validatedPayload = validateSchemaPayload(req.body);

  if (!validatedPayload.isValid) {
    throw AppError.badRequest(validatedPayload.error);
  }

  const { data } = validatedPayload;

  // Successfully validated
  return res.status(200).json({
    status: "ok",
    event: data.event,
    payload: data,
  });
};

import { Request, Response } from "express";
import { getEventRouter } from "../service/webhook.service";
import { AppError } from "../utils/appError";

export const handleWebhookEventController = async (
  req: Request,
  res: Response
) => {
  console.log("req.body", req.body);
  const payload = req.body;
  const eventRouter = getEventRouter();
  const eventHandler = eventRouter[payload.event];
  if (!eventHandler) {
    throw AppError.badRequest(`No handler for event: ${payload.event}`);
  }

  const data = await eventHandler(payload);

  if (data.isValid === false) {
    throw AppError.badRequest(data.error);
  }

  res.status(200).json({
    payload: data,
    processed: true,
  });
};

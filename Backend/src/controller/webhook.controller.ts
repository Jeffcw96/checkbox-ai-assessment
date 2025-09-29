import { Request, Response } from "express";
import { getEventRouter } from "../service/webhook.service";
import { AppError } from "../utils/appError";

export const handleWebhookEventController = async (
  req: Request,
  res: Response
) => {
  console.log("req.body", req.body);
  const payload = req.body;
  //   req payload {
  //   payload: {
  //     event: 'contract.created',
  //     contract: {
  //       id: 'c123',
  //       title: 'Service Agreement with Vendor X',
  //       status: 'Draft',
  //       createdAt: '2025-09-20T12:34:56Z',
  //       comments: [Array],
  //       users: [Array],
  //       documents: [Array]
  //     }
  //   }
  // }
  console.log("data", payload, payload.event);
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

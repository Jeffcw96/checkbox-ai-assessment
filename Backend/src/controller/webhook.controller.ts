import { Request, Response } from "express";
import {
  findEventDomain,
  handleContractEvent,
} from "../service/webhook.service";

export const handleWebhookEventController = async (
  req: Request,
  res: Response
) => {
  const payload = req.body;
  console.log("req payload", payload);

  const domain = findEventDomain(payload.event);

  handleContractEvent(domain);

  res.status(200).json({
    processed: true,
  });
};

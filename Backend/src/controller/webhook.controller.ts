import { Request, Response } from "express";
import { handleContractEvent } from "../service/webhook.service";

export const handleWebhookEventController = async (
  req: Request,
  res: Response
) => {
  const { payload } = req.body;
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

  handleContractEvent(payload.event);

  res.status(200).json({
    payload: payload,
    processed: true,
  });
};

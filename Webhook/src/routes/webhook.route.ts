import express from "express";
import {
  handleWebhookEvent,
  postBackendAPIForTesting,
} from "../controller/webhook.controller";

const webhookRouter = express.Router();

webhookRouter.post("/contracts", postBackendAPIForTesting);
webhookRouter.post("/events", handleWebhookEvent);

export { webhookRouter };

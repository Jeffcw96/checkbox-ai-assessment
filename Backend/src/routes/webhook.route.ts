import express from "express";
import { handleWebhookEventController } from "../controller/webhook.controller";

const webhookRouter = express.Router();

webhookRouter.post("/", handleWebhookEventController);

export { webhookRouter };

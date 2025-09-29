import express from "express";
import { handleWebhookEvent } from "../controller/webhook.controller";

const webhookRouter = express.Router();

webhookRouter.post("/contracts", handleWebhookEvent);

export { webhookRouter };

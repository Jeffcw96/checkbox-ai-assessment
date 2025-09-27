import express from "express";
import { postBackendAPIForTesting } from "../controller/webhook.controller";

const webhookRouter = express.Router();

webhookRouter.post("/contracts", postBackendAPIForTesting);

export { webhookRouter };

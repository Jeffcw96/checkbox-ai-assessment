import express from "express";
import { getHealthController } from "../controller/health.controller";

const healthRouter = express.Router();

healthRouter.get("/", getHealthController);

export { healthRouter };

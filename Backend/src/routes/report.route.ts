import express from "express";
import { getReportController } from "../controller/report.controller";

const reportRouter = express.Router();

reportRouter.get("/", getReportController);

export { reportRouter };

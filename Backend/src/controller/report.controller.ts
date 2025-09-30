import { Request, Response } from "express";
import { getReport } from "../service/report.service";

export const getReportController = async (_req: Request, res: Response) => {
  const result = await getReport();
  console.log("data:", result);
  res.status(200).json(result);
};

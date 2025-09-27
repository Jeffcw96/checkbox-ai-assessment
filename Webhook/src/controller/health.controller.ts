import { Request, Response } from "express";

export const getHealthController = async (_req: Request, res: Response) => {
  res.status(200).json("ok");
};

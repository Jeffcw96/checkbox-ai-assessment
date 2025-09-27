import axios from "axios";
import { Request, Response } from "express";

export const postBackendAPIForTesting = async (
  _req: Request,
  res: Response
) => {
  await axios.get(`${process.env.BACKEND_API_URL}/user`, { timeout: 3000 });

  res.status(200).json("OK");
};

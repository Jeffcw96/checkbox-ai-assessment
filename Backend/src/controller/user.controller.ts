import { Request, Response } from "express";
import { getUserByEmailService } from "../service/user.service";

export const getUserByEmailController = async (
  _req: Request,
  res: Response
) => {
  const result = await getUserByEmailService("jeffdevslife@gmail.com");
  const data = result.data;
  console.log("data:", data);
  res.status(200).json(data);
};

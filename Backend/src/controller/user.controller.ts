import { Request, Response } from "express";
import { getUserByEmail, getUsers } from "../service/user.service";

export const getUserByEmailController = async (
  _req: Request,
  res: Response
) => {
  const result = await getUserByEmail("jeffdevslife@gmail.com");
  const data = result.data;
  console.log("data:", data);
  res.status(200).json(data);
};

export const getUsersController = async (_req: Request, res: Response) => {
  const result = await getUsers();
  const data = result.data;
  console.log("data:", data);
  res.status(200).json(data);
};

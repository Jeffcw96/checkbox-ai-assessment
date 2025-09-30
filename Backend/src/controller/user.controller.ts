import { Request, Response } from "express";
import { createUser, getUserByEmail, getUsers } from "../service/user.service";

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

export const createUserController = async (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required" });
  }
  const result = await createUser(email, name);
  const data = result.data;
  console.log("Created user:", data);
  res.status(201).json(data);
};

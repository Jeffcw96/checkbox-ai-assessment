import express from "express";
import {
  createUserController,
  getUserByEmailController,
  getUsersController,
} from "../controller/user.controller";

const userRouter = express.Router();

userRouter.get("/", getUsersController);
userRouter.post("/", createUserController);
userRouter.get("/email", getUserByEmailController);

export { userRouter };

import express from "express";
import {
  getUserByEmailController,
  getUsersController,
} from "../controller/user.controller";

const userRouter = express.Router();

userRouter.get("/", getUsersController);
userRouter.get("/email", getUserByEmailController);

export { userRouter };

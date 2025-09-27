import express from "express";
import { getUserByEmailController } from "../controller/user.controller";

const userRouter = express.Router();

userRouter.get("/", getUserByEmailController);

export { userRouter };

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { contractRouter } from "./routes/contract.route";
import { userRouter } from "./routes/user.route";
import { webhookRouter } from "./routes/webhook.route";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/user", userRouter);
app.use("/webhook", webhookRouter);
app.use("/contracts", contractRouter);

app.use(errorHandler);

const welcomeStrings = [
  "Hello Express!",
  "To learn more about Express on Vercel, visit https://vercel.com/docs/frameworks/backend/express",
];

app.get("/", (_req, res) => {
  res.send(welcomeStrings.join("\n\n"));
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

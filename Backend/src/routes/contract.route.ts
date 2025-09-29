import express from "express";
import {
  getContractCommentsController,
  getContractDocumentController,
  getContractsController,
} from "../controller/contract.controller";

const contractRouter = express.Router();

contractRouter.get("/", getContractsController);
contractRouter.get("/:contractId/documents", getContractDocumentController);
contractRouter.get("/:contractId/comments", getContractCommentsController);

export { contractRouter };

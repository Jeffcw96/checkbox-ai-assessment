import express from "express";
import {
  getContractByIdController,
  getContractCommentsController,
  getContractDocumentController,
  getContractsController,
} from "../controller/contract.controller";

const contractRouter = express.Router();

contractRouter.get("/", getContractsController);
contractRouter.get("/:contractId/documents", getContractDocumentController);
contractRouter.get("/:contractId/comments", getContractCommentsController);
contractRouter.get("/:id/contract", getContractByIdController);

export { contractRouter };

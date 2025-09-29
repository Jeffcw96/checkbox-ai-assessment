import { Request, Response } from "express";
import { getContractComments } from "../service/comment.service";
import { getContractById, getContracts } from "../service/contract.service";
import { getContractDocument } from "../service/document.service";
import { AppError } from "../utils/appError";

export const getContractsController = async (req: Request, res: Response) => {
  const result = await getContracts();
  res.status(200).json(result);
};

export const getContractByIdController = async (
  req: Request,
  res: Response
) => {
  const contractId = req.params.id;
  const result = await getContractById(contractId);
  if (!result) {
    throw AppError.notFound(`Contract with id ${contractId} not found`);
  }
  res.status(200).json(result);
};

export const getContractCommentsController = async (
  req: Request,
  res: Response
) => {
  const contractId = req.params.id;
  const contract = await getContractById(contractId);
  if (!contract) {
    throw AppError.notFound(`Contract with id ${contractId} not found`);
  }

  const comments = await getContractComments(contractId);

  res.status(200).json(comments);
};

export const getContractDocumentController = async (
  req: Request,
  res: Response
) => {
  const contractId = req.params.id;
  const contract = await getContractById(contractId);
  if (!contract) {
    throw AppError.notFound(`Contract with id ${contractId} not found`);
  }

  const documents = await getContractDocument(contractId);
  res.status(200).json(documents);
};

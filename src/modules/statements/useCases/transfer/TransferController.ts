import { Request, Response } from "express";
import { container } from "tsyringe";
import ICreateTransferDTO from "./ICreateTransferDTO";
import TransferUseCase from "./TransferUseCase";

interface IRequest extends ICreateTransferDTO {};

export class TransferController {
  constructor() {}

  async handle(request: Request, response: Response) {
    const { user } = request;
    const { user_id: recipient_id } = request.params;
    const { amount, description } = request.body;
    // user.id = String(user.id);
    const transferUseCase = container.resolve(TransferUseCase);

    const senderTransfer = await transferUseCase.execute({ sender_id: user.id, recipient_id, amount, description });

    return response.json(senderTransfer)
  }
}

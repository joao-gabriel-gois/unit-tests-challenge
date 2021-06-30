import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Request, Response, response } from "express";
import { inject, injectable } from "tsyringe";
import ICreateTransferDTO from "./ICreateTransferDTO";
import { TransferError } from "./TransferError";
import OperationType from "../../interfaces/enums/OperationType";
import { Statement } from "../../entities/Statement";


@injectable()
export default class TransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ sender_id, recipient_id, amount, description }: ICreateTransferDTO): Promise<Statement> {
    const sender = await this.usersRepository.findById(sender_id);
    const recipient = await this.usersRepository.findById(recipient_id);

    if (!sender || !recipient) {
      throw new TransferError.UserNotFound();
    }

    if (sender_id === recipient_id || sender.id === recipient.id) {
      throw new TransferError.TransferToSameUser();
    }

    const { balance: senderBalance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

    if (senderBalance < amount) {
      throw new TransferError.InsufficientFunds();
    }

    await this.statementsRepository.create({
      user_id: sender_id,
      amount,
      description: `Transfer to ${recipient.name}: ${description}`,
      type: OperationType.WITHDRAW
    });

    const senderTransfer = await this.statementsRepository.create({
      user_id: recipient_id,
      sender_id,
      amount,
      description: `Transfer from ${sender.name}: ${description}`,
      type: OperationType.TRANSFER
    });

    return senderTransfer;
  }
}

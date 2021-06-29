import { AppError } from "../../../../shared/errors/AppError";

export namespace TransferError {
  export class UserNotFound extends AppError {
    constructor() {
      super('One of required users not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 400);
    }
  }
}

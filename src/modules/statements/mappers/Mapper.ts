import { Statement } from "../entities/Statement";

export class Mapper {
  static statementToDTO({
    id,
    sender_id,
    amount,
    description,
    type,
    created_at,
    updated_at
  }: Statement) {
    if (sender_id) {
      return {
        id,
        sender_id,
        amount: Number(amount),
        description,
        type,
        created_at,
        updated_at
      }
    }
    return {
      id,
      amount: Number(amount),
      description,
      type,
      created_at,
      updated_at
    }
  }

  static balanceToDTO({statement, balance}: { statement: Statement[], balance: number}) {
    const parsedStatement = statement.map(currentStatement => {
      return Mapper.statementToDTO(currentStatement);
    });

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}

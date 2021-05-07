import OperationType from "@modules/statements/interfaces/enums/OperationType";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { User } from "@modules/users/entities/User";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AppError } from "@shared/errors/AppError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

interface ICreateStatementRequest extends Omit<ICreateStatementDTO, 'description' | 'type'> {
  description?: string;
  type?: OperationType;
}

let user: User;

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

const createStatementRequest = ({
  user_id,
  type = OperationType.WITHDRAW,
  amount
}: ICreateStatementRequest) => ({
  user_id,
  type,
  amount,
  description: `Generic ${type} description`
});

describe('Get Balance', () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);

    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);

    user = await createUserUseCase.execute({
      name: 'Test',
      email: 'test@test.dev',
      password: '123456'
    });
  });

  it('should be able to get balance from an user', async () => {
    const depositRequest = createStatementRequest({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 120
    });

    const withdrawRequest = createStatementRequest({
      user_id: String(user.id),
      amount: 80
    });

    const deposit = await createStatementUseCase.execute(depositRequest);
    const withdraw = await createStatementUseCase.execute(withdrawRequest);

    const transactions = await getBalanceUseCase.execute({ user_id: String(user.id) });

    expect(transactions.balance).toBe(depositRequest.amount - withdrawRequest.amount);

    expect(transactions.statement).toEqual(
      expect.arrayContaining([
        expect.objectContaining(deposit),
        expect.objectContaining(withdraw)
      ])
    );

    expect(transactions.statement.length).toBe(2);
  });

  it('should not be able to get balance from non-existing user', () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: 'non-exsting-user-id' });
    }).rejects.toBeInstanceOf(AppError);
  });

});

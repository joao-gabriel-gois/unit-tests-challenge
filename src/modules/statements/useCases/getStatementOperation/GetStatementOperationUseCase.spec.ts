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
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

interface ICreateStatementRequest extends Omit<ICreateStatementDTO, 'description' | 'type'> {
  description?: string;
  type?: OperationType;
}

let user: User;

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

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

    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);

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

    const deposit = await createStatementUseCase.execute(depositRequest);

    const statement = await getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: String(deposit.id)
    });

    expect(statement).toHaveProperty('id');
    expect(statement).toEqual(
      expect.objectContaining(depositRequest)
    );
  });

  it('should not be able to get statement operation from non-existing user', () => {
    expect(async () => {
      const depositRequest = createStatementRequest({
        user_id: String(user.id),
        amount: 80,
        type: OperationType.DEPOSIT
      });

      const deposit = await createStatementUseCase.execute(depositRequest);

      await getStatementOperationUseCase.execute({
        user_id: 'non-exsting-user-id',
        statement_id: String(deposit.id)
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to get statement operation from non-existing statement', () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: 'non-existing-statement-id'
      });
    }).rejects.toBeInstanceOf(AppError);
  });

});

import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import OperationType from '../../interfaces/enums/OperationType';
import { User } from "@modules/users/entities/User";
import { AppError } from "@shared/errors/AppError";

interface ICreateStatementRequest extends Omit<ICreateStatementDTO, 'description' | 'type'> {
  description?: string;
  type?: OperationType;
}

let user: User;

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

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

describe('Create Statement', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );

    user = await createUserUseCase.execute({
      name: 'Test',
      email: 'test@test.dev',
      password: '123456'
    });
  });

  it('should be able to create all types of statements', async () => {
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

    expect(deposit).toEqual(
      expect.objectContaining(depositRequest)
    );
    expect(deposit).toHaveProperty('id');

    expect(withdraw).toEqual(
      expect.objectContaining(withdrawRequest)
    );
    expect(withdraw).toHaveProperty('id');
  });

  it('should be able create a statement for non-existing user', () => {
    expect(async () => {
      const depositRequest = createStatementRequest({
        user_id: 'non-existing-id',
        type: OperationType.DEPOSIT,
        amount: 80
      });

      await createStatementUseCase.execute(depositRequest);
    }).rejects.toBeInstanceOf(AppError);
  });


  it('should be able to withdraw when there is no funds', () => {
    expect(async () => {
      const withdrawRequest = createStatementRequest({
        user_id: String(user.id),
        amount: 80
      });

      await createStatementUseCase.execute(withdrawRequest);
    }).rejects.toBeInstanceOf(AppError);
  });

});

import { AppError } from "@shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: IUsersRepository;

describe('Create User', () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it('should be able to create an user', async () => {
    const userRequest = {
      name: 'Test User',
      email: 'test@user.dev',
      password: 'test_user_psswd'
    };

    const user = await createUserUseCase.execute(userRequest);

    expect(user).toHaveProperty('id');
    expect(
      expect.objectContaining(userRequest)
    );
  });

  it('should not be able to create an user with repeated email', async () => {
    expect( async () => {
      const userRequest = {
        name: 'Test User 2',
        email: 'test@user.dev',
        password: 'test_user_other_psswd'
      };

      await createUserUseCase.execute(userRequest);
    }).rejects.toBeInstanceOf(AppError);
  });
});

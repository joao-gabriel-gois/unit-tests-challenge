import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { AppError } from "@shared/errors/AppError";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepository: IUsersRepository;

interface ILoginRequest {
  email: string;
  password: string;
}

describe('Authenticate User', () => {
  let userLogin: ILoginRequest;

  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

    userLogin = {
      email: 'test@test.dev',
      password: '123456',
    }
  });

  it('should be able to authenticate user', async () => {
    const userCreationInfo = { name: 'Test', ...userLogin };

    await createUserUseCase.execute(userCreationInfo);

    const auth = await authenticateUserUseCase.execute(userLogin);

    const expectedReturnFromAuthUser = {
      name: userCreationInfo.name,
      email: userCreationInfo.email
    }

    expect(auth).toEqual(
      expect.objectContaining({
        user: expect.objectContaining(expectedReturnFromAuthUser)
      })
    );

    expect(auth.user).toHaveProperty('id');
  });

  it('should not be able to auth user with non-existing email', async () => {
    expect(async () => {
      const wrongLoginEmail = {
        ...userLogin,
        email: 'wrong@email.com'
      };

      await authenticateUserUseCase.execute(wrongLoginEmail);

    }).rejects.toBeInstanceOf(AppError);

  });

  it('should not be able to auth user with wrong password', async () => {
    expect(async () => {
      const wrongLoginPassword = {
        ...userLogin,
        password: 'wrong-password'
      };

      await authenticateUserUseCase.execute(wrongLoginPassword);
    }).rejects.toBeInstanceOf(AppError);
  });
});

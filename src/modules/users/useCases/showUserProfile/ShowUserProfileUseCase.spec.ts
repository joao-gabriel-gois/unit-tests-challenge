import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { AppError } from "@shared/errors/AppError";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

let usersRepository: IUsersRepository;


interface ILoginRequest {
  email: string;
  password: string;
}

describe('Show User Profile', () => {
  let userLogin: ILoginRequest;

  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);

    userLogin = {
      email: 'test@test.dev',
      password: '123456',
    }
  });

  it('should be able to show user profile', async () => {
    const userCreationInfo = { name: 'Test', ...userLogin };

    const user = await createUserUseCase.execute(userCreationInfo);

    const profile = await showUserProfileUseCase.execute(String(user.id));

    expect(profile).toEqual(
      expect.objectContaining(user)
    );
  });

  it('should not be able to show a non-existing user profile', () => {
    expect(async () => {
      await showUserProfileUseCase.execute('fake-user-id');
    }).rejects.toBeInstanceOf(AppError);
  });
});

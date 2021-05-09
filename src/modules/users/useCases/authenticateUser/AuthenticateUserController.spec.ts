import { Connection, createConnection } from 'typeorm';
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../app';
import { hash } from 'bcryptjs';


let connection: Connection;
const apiVersion = '/api/v1';
const nameAndPasswordValue = 'admin';

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const passwordHash = await hash(nameAndPasswordValue, 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', '${nameAndPasswordValue}', 'admin@rentx.dev', '${passwordHash}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    const userData = {
      email: 'admin@rentx.dev',
      password: nameAndPasswordValue
    };

    const authResponse = await request(app).post(`${apiVersion}/sessions`).send(userData);

    const { user } = authResponse.body;

    expect(authResponse.body).toHaveProperty('token');
    expect(authResponse.body).toHaveProperty('user');

    expect(user).toHaveProperty('id');

    expect(user).toEqual(
      expect.objectContaining({
        email: userData.email,
        name: nameAndPasswordValue
      })
    );
  });

  it('should not be able to authenticate a non-existing user', async () => {
    const userData = {
      email: 'non-existing-user@rentx.dev',
      password: nameAndPasswordValue
    };

    const authResponse = await request(app).post(`${apiVersion}/sessions`).send(userData);

    expect(authResponse.status).toBe(401);
  });


  it('should not be able to authenticate an user using wrong password', async () => {
    const userData = {
      email: 'admin@rentx.dev',
      password: 'wrong-password'
    };

    const authResponse = await request(app).post(`${apiVersion}/sessions`).send(userData);

    expect(authResponse.status).toBe(401);
  });
});

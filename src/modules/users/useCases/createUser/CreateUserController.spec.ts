import { Connection, createConnection } from 'typeorm';
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../app';
import { hash } from 'bcryptjs';


let connection: Connection;
const apiVersion = '/api/v1';
const nameAndPasswordValue = 'admin';

const userData = {
  name: nameAndPasswordValue,
  email: 'admin@rentx.dev',
  password: nameAndPasswordValue
};

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create an user', async () => {
    const creationResponse = await request(app).post(`${apiVersion}/users`).send(userData);

    expect(creationResponse.status).toBe(201);
  });

  it('should not be able to create an user with repeated email', async () => {
    const creationResponse = await request(app).post(`${apiVersion}/users`).send(userData);

    expect(creationResponse.status).toBe(400);
  });

});

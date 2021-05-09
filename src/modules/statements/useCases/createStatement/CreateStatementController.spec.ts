import { Connection, createConnection } from 'typeorm';
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../app';
import { hash } from 'bcryptjs';


let connection: Connection;
let userToken: string;
const apiVersion = '/api/v1';

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash('admin', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@rentx.dev', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new deposit statement', async () => {
    const responseToken = await request(app).post(`${apiVersion}/sessions`).send({
      email: 'admin@rentx.dev',
      password: 'admin'
    });

    const { token } = responseToken.body;
    userToken = token;

    const response = await request(app).post(`${apiVersion}/statements/deposit`).send({
      amount: 100,
      description: 'Freelance payment'
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        amount: 100,
        description: 'Freelance payment',
        type: 'deposit'
      })
    );
    expect(response.body).toHaveProperty('id');
  });

  it('should be able to create a new withdraw statement', async () => {
    const response = await request(app).post(`${apiVersion}/statements/withdraw`).send({
      amount: 80,
      description: 'Lunch'
    }).set({
      Authorization: `Bearer ${userToken}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        amount: 80,
        description: 'Lunch',
        type: 'withdraw'
      })
    );
    expect(response.body).toHaveProperty('id');
  });


  it('should not be able to create a statement for non-existing users', async () => {
    const fakeToken = 'fake-value-for-token';

    const response = await request(app).post(`${apiVersion}/statements/deposit`).send({
      amount: 100,
      description: 'Freelance payment'
    }).set({
      Authorization: `Bearer ${fakeToken}`
    });

    expect(response.status).toBe(401); // ensure auth test
  });

  it('should not be able to withraw with insuficient funds', async () => {
    const response = await request(app).post(`${apiVersion}/statements/withdraw`).send({
      amount: 30,
      description: 'Emergency Bill'
    }).set({
      Authorization: `Bearer ${userToken}`
    });

    expect(response.status).toBe(400);
  });
});


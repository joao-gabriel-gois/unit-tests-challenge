import { Connection } from 'typeorm';
import createConnection from '../../../../database'
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../app';
import { hash } from 'bcryptjs';


let connection: Connection | undefined;
const APIv = '/api/v1';

describe('Get Balance Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection!.runMigrations();

    const id = uuid();
    const password = await hash('admin', 8);

    await connection!.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@rentx.dev', '${password}', 'now()', 'now()')`
    );
  });


  afterAll(async () => {
    await connection!.dropDatabase();
    await connection!.close();
  });

  it('should be able to get balance', async () => {
    const authResponse = await request(app).post(`${APIv}/sessions`).send({
      email: 'admin@rentx.dev',
      password: 'admin'
    });

    const { token } = authResponse.body;

    const deposit = await request(app).post(`${APIv}/statements/deposit`).send({
      amount: 100,
      description: 'Freelance payment'
    }).set({
      Authorization: `Bearer ${token}`
    });

    const withdraw = await request(app).post(`${APIv}/statements/withdraw`).send({
      amount: 50,
      description: 'Freelance payment'
    }).set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).get(`${APIv}/statements/balance`).set({
      Authorization: `Bearer ${token}`
    });

    const { statement, balance } = response.body;

    expect(response.status).toBe(200);
    expect([deposit.body, withdraw.body]).toEqual(
      expect.arrayContaining([
        expect.objectContaining(statement[0]),
        expect.objectContaining(statement[1]),
      ])
    );
    expect(balance).toBe(deposit.body.amount - withdraw.body.amount);

  });

  it('should not be able to get balance for a non-exsiting user', async () => {
    const fakeToken = 'fake-user-token';
    const response = await request(app).get(`${APIv}/statements/balance`).set({
      Authorization: `Bearer ${fakeToken}`
    });

    expect(response.status).toBe(401);
  })
});



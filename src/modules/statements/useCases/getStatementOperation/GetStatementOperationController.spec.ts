import { Connection } from 'typeorm';
import createConnection from '../../../../database'
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../app';
import { hash } from 'bcryptjs';


let connection: Connection | undefined;
const APIv = '/api/v1';

describe('Get Balance Controller', () => {

  beforeEach(async () => {
    connection = await createConnection();
    await connection!.runMigrations();

    const id = uuid();
    const password = await hash('admin', 8);

    await connection!.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@rentx.dev', '${password}', 'now()', 'now()')`
    );
  });


  afterEach(async () => {
    await connection!.dropDatabase();
    await connection!.close();
  });

  it('should be able to get deposit operation', async () => {
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

    const response = await request(app).get(`${APIv}/statements/${deposit.body.id}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toEqual(
      expect.objectContaining({
        description: 'Freelance payment',
        type: 'deposit'
      })
    );
  });

});

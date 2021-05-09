import { Connection, createConnection } from 'typeorm';
import request from 'supertest';
import { v4 as uuid } from 'uuid';
import { app } from '../../../../app';
import { hash } from 'bcryptjs';


let connection: Connection;
const apiVersion = '/api/v1';

describe('Show User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const passwordHash = await hash('admin', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@rentx.dev', '${passwordHash}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show an user profile', async () => {
    const responseToken = await request(app).post(`${apiVersion}/sessions`).send({
      email: 'admin@rentx.dev',
      password: 'admin'
    });

    const { token, user } = responseToken.body;

    const response = await request(app).get(`${apiVersion}/profile`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');

    expect(response.body).toEqual(
      expect.objectContaining(user)
    );


  });

  it('should not be able to show profile for non-existing users', async () => {
    const fakeToken = 'fake-value-for-token';

    const response = await request(app).post(`${apiVersion}/profile`).set({
      Authorization: `Bearer ${fakeToken}`
    });

    expect(response.status).toBe(401); // ensure auth test
  });

});


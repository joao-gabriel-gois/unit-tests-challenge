import { Connection, createConnection, getConnectionOptions } from 'typeorm';
let connection: () => Promise<Connection | undefined>;

if (process.env.NODE_ENV === 'test') {
  connection = async (): Promise<Connection> => {
    const defaultOptions = await getConnectionOptions();

    return createConnection(
      Object.assign(defaultOptions, {
        host: 'localhost',
        database: 'fin_api_test',
        name: 'default'
      })
    );
  };
}

else {
  connection = async (): Promise<Connection> => {
    const defaultOptions = await getConnectionOptions();

    return createConnection(
      Object.assign(defaultOptions, {
        database: 'fin_api',
        // name: 'default'
      })
    );
  };

  // createConnection();
  // connection = async () => undefined;
}

export default connection;

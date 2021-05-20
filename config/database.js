/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
/* eslint-disable brace-style */
import mysql from 'mysql'
import 'dotenv/config'

const dbConfig = {
  connectionLimit: 10,
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  multipleStatements: true,
};

let connection = mysql.createPool(dbConfig);

connection.on('connection', () => console.log('Pooled connection established.'));

// - Reconnection function
function reconnect(connec) {
  console.log('\n New connection tentative...');
  // - Destroy the current connection variable
  if (connec && typeof connection.end === 'function') connection.end();

  // - Create a new one
  connection = mysql.createPool(dbConfig);

  setTimeout(testConnection, 2000);
}

// - Error listener

function errorHandler(err = this) {
  // - The server close the connection.
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log(`/!\\ Cannot establish a connection with the database. /!\\ (${err.code})`);
    reconnect(connection, err);
  }

  // - Connection in closing
  else if (err.code === 'PROTOCOL_ENQUEUE_AFTER_QUIT') {
    console.log(`/!\\ Cannot establish a connection with the database. /!\\ (${err.code})`);
    reconnect(connection, err);
  }

  // - Fatal error : connection variable must be recreated
  else if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
    console.log(`/!\\ Cannot establish a connection with the database. /!\\ (${err.code})`);
    reconnect(connection, err);
  }

  // - Error because a connection is already being established
  else if (err.code === 'PROTOCOL_ENQUEUE_HANDSHAKE_TWICE') {
    console.log(`/!\\ Cannot establish a connection with the database. /!\\ (${err.code})`);
  } else if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.')
    reconnect(connection, err);
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.')
  } else if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.')
    reconnect(connection, err);
  } else if (err.code === 'ERR_SOCKET_BAD_PORT') {
    console.error('Database connection bad port.')
  }
  // - Anything else
  else {
    console.log(`/!\\ Cannot establish a connection with the database. /!\\ (${err.code})`);
    reconnect(connection, err);
  }
}

function testConnection() {
  // - Establish a new connection
  connection.getConnection((err, connec) => {
    if (err) {
      // mysqlErrorHandling(connection, err);
      console.log('\n\t *** Cannot establish a connection with the database. ***');
      setTimeout(errorHandler.bind(err), 2000);
    } else {
      console.log('\n\t *** New connection established with the database. ***')
    }

    if (connec) connec.release()
  });
}

connection.on('error', (err) => errorHandler(err));

// connection handling middleware
connection.getConnection((err, connec) => {
  if (err) errorHandler(err)

  if (connec) connec.release()
})

// - Establish a new connection
const DB = {
  query: (sql, data, callback) => {
    connection.query(sql, data, (err, result, fields) => {
      if (err) {
        if (err.code === 'POOL_CLOSED') {
          console.log(err)
          errorHandler(err)
          setTimeout(() => {
            DB.query(sql, data, callback)
          }, 100);
        } else return callback(err, undefined, undefined)
      } else return callback(undefined, result, fields) // Do something with result.
    })
  },
}

export default DB;

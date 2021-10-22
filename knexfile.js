module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_CONNECTION_STRING,
  migrations: {
    directory: './db/migrations',
    extension: 'js',
  },
  seeds: {
    directory: './db/seeds',
    extension: 'js',
  },
}

module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_CONNECTION_STRING,
  migrations: {
    directory: './migrations',
    extension: 'js',
  },
  seeds: {
    directory: './seeds',
    extension: 'js',
  },
}
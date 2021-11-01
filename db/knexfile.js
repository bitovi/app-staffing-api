module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_CONNECTION_STRING,
  searchPath: ['knex', 'public'],
  migrations: {
    directory: './migrations',
    extension: 'js'
  },
  seeds: {
    directory: './seeds',
    extension: 'js'
  }
}

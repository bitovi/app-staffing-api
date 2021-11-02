const config = require('./config')

module.exports = {
  client: 'pg',
  connection: config.get('DATABASE_CONNECTION_STRING'),
  searchPath: ['knex', 'public'],
  migrations: {
    directory: '../db/migrations',
    extension: 'js'
  },
  seeds: {
    directory: '../db/seeds',
    extension: 'js'
  }
}

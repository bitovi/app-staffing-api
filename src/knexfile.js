const config = require('./config')
const path = require('path')

module.exports = {
  client: 'pg',
  connection: config.get('DATABASE_CONNECTION_STRING'),
  searchPath: ['knex', 'public'],
  migrations: {
    directory: '../db/migrations',
    extension: 'js'
  },
  seeds: {
    directory: path.relative(process.cwd(), config.get('DB_SEEDS_DIR')),
    extension: 'js'
  }
}

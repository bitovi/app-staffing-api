const convict = require('convict')

const config = convict({
  APP_PORT: {
    doc: 'The api port.',
    format: 'port',
    default: 3001,
    env: 'APP_PORT'
  },
  DATABASE_CONNECTION_STRING: {
    doc: 'The database connection string.',
    format: String,
    default: 'postgres://dbuser:dbpassword@localhost:5432/staffing_test',
    env: 'DATABASE_CONNECTION_STRING'
  },
  DB_SEEDS_DIR: {
    doc: 'The database seeds directory.',
    default: '../db/seeds',
    env: 'DB_SEEDS_DIR'
  }
})

// Perform validation
config.validate({ allowed: 'strict' })

module.exports = config

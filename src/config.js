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
  }
})

// Perform validation
config.validate({ allowed: 'strict' })

module.exports = config

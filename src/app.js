'use strict'

const server = require('./server')()
const config = require('./config')
const APP_PORT = config.get('APP_PORT')

server
  .enableGoogleAuth()
  .listen(APP_PORT, '0.0.0.0')
  .then(address => {
    console.log(`Server is now listening on ${address}`)
  })
  .catch(err => {
    server.log.error(err)
    process.exit(1)
  })

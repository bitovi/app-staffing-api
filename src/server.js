const { Model } = require('objection')
const fastify = require('fastify')({
  logger: true
})

const config = require('./config')
const knexfile = require('./knexfile')
const APP_PORT = config.get('APP_PORT')

const start = async () => {
  Model.knex(knexfile)

  // Declare a route
  fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  // Run the server!
  // Host '0.0.0.0' so that docker networking works
  return fastify.listen(APP_PORT, '0.0.0.0')
    .then(address => {
      console.log(`Server is now listening on ${address}`)
    })
    .catch(err => {
      fastify.log.error(err)
      process.exit(1)
    })
}

const stop = () => {
  return fastify.close()
}

module.exports = {
  start,
  stop
}

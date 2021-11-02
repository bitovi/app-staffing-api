const { Model } = require('objection')
const knexfile = require('./knexfile')
const { skillRoutes } = require('./routes')

const fastify = require('fastify')({
  logger: true
})
const APP_PORT = process.env.APP_PORT || 3000

const start = () => {
  // TODO: put in a better place?
  // Give the knex instance to Objection
  const knex = require('knex')(knexfile)
  Model.knex(knex)

  // Declare a route
  fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  skillRoutes(fastify)

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

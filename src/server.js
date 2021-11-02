const { Model } = require('objection')
const Knex = require('knex')
const fastify = require('fastify')({
  logger: true
})

const projectRoutes = require('./routes/project.js')

const config = require('./config')
const knexfile = require('./knexfile')
const APP_PORT = config.get('APP_PORT')

const start = async () => {
  const knex = Knex(knexfile)
  Model.knex(knex)

  // Declare a route
  fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  for (const routeKey in projectRoutes) {
    fastify.route(projectRoutes[routeKey])
  }

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

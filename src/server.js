const { Model } = require('objection')
const Knex = require('knex')
const knexConfig = require('./knexfile')

const knex = Knex(knexConfig)
Model.knex(knex)

const fastify = require('fastify')({
  logger: true
})
fastify.addContentTypeParser('application/vnd.api+json', { parseAs: 'string' }, fastify.getDefaultJsonParser('ignore', 'ignore'))

const APP_PORT = process.env.APP_PORT || 3000

const registerService = (def) => Object.values(def).forEach(route => fastify.route(route))

const start = () => {
  // Declare a route
  fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  registerService(require('./services/employees'))

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

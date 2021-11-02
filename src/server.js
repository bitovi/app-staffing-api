const { Model } = require('objection')
const Knex = require('knex')
const knexConfig = require('./knexfile')
const employeesService = require('./services/employees')

const knex = Knex(knexConfig)
Model.knex(knex)

const fastify = require('fastify')({
  logger: true
})
fastify.addContentTypeParser('application/vnd.api+json', { parseAs: 'string' }, fastify.getDefaultJsonParser('ignore', 'ignore'))

const APP_PORT = process.env.APP_PORT || 3000

employeesService(fastify)

const start = () => {
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

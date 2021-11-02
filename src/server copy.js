const { Model } = require('objection')
const Knex = require('knex')
const knexConfig = require('./knexfile')
const { Serializer } = require('./json-api-serializer')

const knex = Knex(knexConfig)
Model.knex(knex)

const fastify = require('fastify')({
  logger: true
})

// Custom Content-Type parser for JSON-API spec
fastify.addContentTypeParser('application/vnd.api+json', { parseAs: 'string' }, (request, payload, done) => {
  try {
    const body = JSON.parse(payload)
    const result = Serializer.deserialize(body.data?.type, body)
    done(null, result)
  } catch (error) {
    error.status = 422
    done(error)
  }
})
// Custom Error handler for JSON-API spec
fastify.setErrorHandler(function (error, request, reply) {
  const status = error.status || 500
  this.log.error(error)
  reply.status(status).send({
    status: status,
    title: error.message
  })
})

const APP_PORT = process.env.APP_PORT || 3000

const registerService = (def) => Object.values(def).forEach(route => fastify.route(route))

const start = () => {
  // Declare a route
  fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  registerService(require('./routes/employee'))

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

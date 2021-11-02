const { Model } = require('objection')
const Knex = require('knex')
const { Serializer } = require('./json-api-serializer')
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

const config = require('./config')
const knexfile = require('./knexfile')
const APP_PORT = config.get('APP_PORT')

const registerService = (def) => Object.values(def).forEach(route => fastify.route(route))

const start = async () => {
  const knex = Knex(knexfile)
  Model.knex(knex)

  // Declare a route
  fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  registerService(require('./routes/role.js'))
  registerService(require('./routes/skill.js'))
  registerService(require('./routes/project.js'))
  registerService(require('./routes/employee.js'))

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

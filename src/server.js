const { Model } = require('objection')
const Knex = require('knex')
const { Serializer } = require('./json-api-serializer')
const knexfile = require('./knexfile')

const build = () => {
  const knex = Knex(knexfile)
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

  const registerService = (def) => Object.values(def).forEach(route => fastify.route(route))

  // Declare a route
  fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  registerService(require('./routes/role.js'))
  registerService(require('./routes/skill.js'))
  registerService(require('./routes/project.js'))
  registerService(require('./routes/employee.js'))

  return fastify
}

module.exports = build

const { Model } = require('objection')
const Knex = require('knex')
const { Serializer } = require('./json-api-serializer')
const knexfile = require('./knexfile')
const setupFastifySwagger = require('./fastify-swagger')

const build = () => {
  const knex = Knex(knexfile)
  Model.knex(knex)

  const fastify = require('fastify')({
    logger: false
  })

  // Enable CORS for all routes
  fastify.register(require('fastify-cors'))

  setupFastifySwagger(fastify)

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
    if (error?.validation) {
      error.statusCode = 400
    }
    const status = error.status || error.statusCode || 500
    this.log.error(error)
    reply.status(status).send({
      status: status,
      title: error.message
    })
  })
  fastify.addHook('onClose', async (server, done) => {
    await knex.destroy()
    done()
  })

  const registerService = (def) => Object.values(def).forEach(route => fastify.route(route))

  registerService(require('./routes/role.js'))
  registerService(require('./routes/skill.js'))
  registerService(require('./routes/project.js'))
  registerService(require('./routes/employee.js'))
  registerService(require('./routes/assignment.js'))

  return fastify
}

module.exports = build

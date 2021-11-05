const { Model } = require('objection')
const Knex = require('knex')
const createError = require('http-errors')
const { OAuth2Client } = require('google-auth-library')
const { Serializer } = require('./json-api-serializer')
const knexfile = require('./knexfile')

const GoogleAuthClientId = '587564559875-48vd2efg2vd4ligphjkuvhcs4fsf0ek9.apps.googleusercontent.com'

const build = () => {
  const knex = Knex(knexfile)
  Model.knex(knex)

  const fastify = require('fastify')({
    logger: true
  })

  fastify.register(require('fastify-cors'), {
    origin: true
  })

  fastify.register(require('fastify-auth'))

  fastify.decorate('asyncValidateGoogleAuth', async function (request, reply) {
    const { authorization } = request.headers

    if (!authorization) {
      throw createError(401)
    }

    if (!request.state) {
      request.state = {}
    }

    const tokenId = authorization.replace('Bearer ', '')
    const client = new OAuth2Client(GoogleAuthClientId)

    try {
      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: GoogleAuthClientId
      })
      const payload = ticket.getPayload()
      request.state.user = payload
    } catch (err) {
      console.error(err)
      throw createError(401)
    }
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

  fastify.after(() => {
    fastify.addHook('preHandler', fastify.auth([
      fastify.asyncValidateGoogleAuth
    ]))
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
  registerService(require('./routes/assignment.js'))

  return fastify
}

module.exports = build

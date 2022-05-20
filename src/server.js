const { Model } = require('objection')
const Knex = require('knex')
const { Serializer } = require('./json-api-serializer')
const knexfile = require('./knexfile')
const setupFastifySwagger = require('./fastify-swagger')
const errorHandler = require('./managers/error-handler')
const { statusCodes } = require('./managers/error-handler/constants')
const { GeneralError } = require('./managers/error-handler/errors')
const { OAuth2Client } = require('google-auth-library')
const createError = require('http-errors')

const GoogleAuthClientId = '171066568525-kc3tu5jd313id60t355hm51v0i5udree.apps.googleusercontent.com'

const build = () => {
  const knex = Knex(knexfile)
  Model.knex(knex)

  const fastify = require('fastify')({
    logger: false,
    ajv: {
      customOptions: {
        schemaId: 'auto',
        removeAdditional: false,
        allErrors: true
      }
    }
  })
  fastify.decorate('enableGoogleAuth', function () {
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
    fastify.after(() => {
      fastify.addHook('preHandler', fastify.auth([
        fastify.asyncValidateGoogleAuth
      ]))
    })
    return fastify
  })
  // Enable CORS for all routes
  fastify.register(require('fastify-cors'))
  fastify.register(require('fastify-auth'))

  setupFastifySwagger(fastify)

  // Custom Content-Type parser for JSON-API spec
  fastify.addContentTypeParser(
    'application/vnd.api+json',
    { parseAs: 'string' },
    (request, payload, done) => {
      try {
        const body = JSON.parse(payload)
        const result = Serializer.deserialize(body.data?.type, body)
        done(null, result)
      } catch (error) {
        done(new GeneralError({ ...error, status: statusCodes.UNPROCESSABLE_ENTITY }))
      }
    }
  )

  // Custom Error handler for JSON-API spec
  fastify.setErrorHandler(errorHandler)

  fastify.addHook('onClose', async (server, done) => {
    await knex.destroy()
    done()
  })

  const registerService = (def) =>
    Object.values(def).forEach((route) => fastify.route(route))

  registerService(require('./routes/role.js'))
  registerService(require('./routes/skill.js'))
  registerService(require('./routes/project.js'))
  registerService(require('./routes/employee.js'))
  registerService(require('./routes/assignment.js'))

  return fastify
}

module.exports = build

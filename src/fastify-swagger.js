const commonSchemas = require('./schemas/query-string')

module.exports = function setupFastifySwagger (fastify) {
  fastify.register(require('fastify-swagger'), {
    routePrefix: '/docs',
    swagger: {
      info: {
        customSiteTitle: 'Staffing App API',
        title: 'app-staffing-api',
        description: 'Staffing App API',
        version: '0.1.0'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      host: 'localhost:3000',
      schemes: ['http'],
      consumes: ['application/vnd.api+json'],
      produces: ['application/vnd.api+json'],
      tags: [
        { name: 'assignment', description: 'Assignment-related endpoints' },
        { name: 'employee', description: 'Employee-related endpoints' }
      ],
      definitions: {
        User: {
          type: 'object',
          required: ['id', 'email'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' }
          }
        }
      },
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header'
        }
      }
    },
    uiConfig: {
      // docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true
  })
}

const assignmentSchema = require('./schemas/assignment')
const employeeSchema = require('./schemas/employee')
const projectSchema = require('./schemas/project')
const roleSchema = require('./schemas/role')
const skillSchema = require('./schemas/skill')

module.exports = function setupFastifySwagger (fastify) {
  fastify.register(require('fastify-swagger'), {
    routePrefix: '/docs',
    swagger: {
      info: {
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
        { name: 'employee', description: 'Employee-related endpoints' },
        { name: 'project', description: 'Project-related endpoints' },
        { name: 'role', description: 'Role-related endpoints' },
        { name: 'skill', description: 'Skill-related endpoints' }
      ],
      definitions: {
        Assignment: { type: 'object', properties: assignmentSchema.properties },
        Employee: { type: 'object', properties: employeeSchema.properties },
        Project: { type: 'object', properties: projectSchema.properties },
        Role: { type: 'object', properties: roleSchema.properties },
        Skill: { type: 'object', properties: skillSchema.properties }
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

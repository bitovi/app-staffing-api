const knexConfigFile = "./knexfile.js";
const knexConfig = require(knexConfigFile);

const Knex = require("knex");
const { Model } = require("objection");
const knex = Knex(knexConfig);
Model.knex(knex);

const fastify = require('fastify')({
  logger: true
})
const APP_PORT = process.env.APP_PORT || 3000

const roleRoutes = require('./routes/role.js');

const start = () => {
  // Declare a route
  fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
  })

  for (const routeKey in roleRoutes) {
    fastify.route(roleRoutes[routeKey])
  }

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

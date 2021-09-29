'use strict'

const fastify = require('fastify')({
  logger: true
});
const APP_PORT = process.env.APP_PORT || 3000;

// Declare a route
fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
});

// Run the server!
fastify.listen(APP_PORT, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  console.log(`Server is now listening on ${address}`);
});

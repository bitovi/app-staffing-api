
exports.up = async (knex) => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;')

  await knex.schema.createTable('skill', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('name').notNullable()
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('skill')

  // await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp";')
}

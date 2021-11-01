exports.up = async (knex) => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "public"')
  await knex.schema.createTable('employee', (table) => {
    table.uuid('id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary()
    table.string('name').notNullable()
    table.date('start_date').nullable()
    table.date('end_date').nullable()
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('employee')
}

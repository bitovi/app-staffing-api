exports.up = async (knex) => {
  await knex.schema.createTable('employee', (table) => {
    table.uuid('id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary()
    table.string('name').notNullable()
    table.timestamp('start_date').nullable()
    table.timestamp('end_date').nullable()
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('employee')
}

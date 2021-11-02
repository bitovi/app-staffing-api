exports.up = async (knex) => {
  await knex.schema.createTable('project', function (table) {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary()
    table.string('name').notNullable()
    table.date('start_date').notNullable()
    table.date('end_date')
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('project')
}

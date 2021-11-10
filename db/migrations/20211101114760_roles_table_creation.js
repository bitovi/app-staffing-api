exports.up = async (knex) => {
  await knex.schema.createTable('role', function (table) {
    table.uuid('id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary()
    table.timestamp('start_date')
    table.integer('start_confidence')
    table.timestamp('end_date')
    table.integer('end_confidence')
    table.uuid('project_id').references('project.id').notNullable()
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('role')
}

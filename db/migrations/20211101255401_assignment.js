
exports.up = async (knex) => {
  await knex.schema.createTable('assignment', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.uuid('employee_id').references('employee.id').notNullable()
    table.uuid('role_id').references('role.id').notNullable()
    table.timestamp('start_date').notNullable()
    table.timestamp('end_date')
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('assignment')
}

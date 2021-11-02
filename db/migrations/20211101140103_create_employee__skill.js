exports.up = async (knex) => {
  await knex.schema.createTable('employee__skill', (table) => {
    table.uuid('employee_id').references('employee.id').notNullable()
    table.uuid('skill_id').references('skill.id').notNullable()
    table.primary(['employee_id', 'skill_id'])
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('employee__skill')
}

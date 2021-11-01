exports.up = async (knex) => {
  await knex.schema.createTable('employee__skill', (table) => {
    table.uuid('employee_id')
    table.uuid('skill_id')
    table.primary(['employee_id', 'skill_id'])
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('employee__skill')
}

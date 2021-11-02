
exports.up = async (knex) => {
  await knex.schema.createTable('role__skill', (table) => {
    table.uuid('role_id').references('role.id').notNullable()
    table.uuid('skill_id').references('skill.id').notNullable()
    table.primary(['role_id', 'skill_id'])
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('role__skill')
}

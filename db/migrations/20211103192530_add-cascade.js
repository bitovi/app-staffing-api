exports.up = async (knex) => {
  await knex.schema.alterTable('role', (table) => {
    table.dropForeign('project_id')
  })
  await knex.schema.alterTable('role', (table) => {
    table.uuid('project_id')
      .references('project.id')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .index()
      .alter()
  })
  await knex.schema.alterTable('employee__skill', (table) => {
    table.dropPrimary()
    table.dropForeign('employee_id')
    table.dropForeign('skill_id')
  })
  await knex.schema.alterTable('employee__skill', (table) => {
    table.uuid('employee_id')
      .references('employee.id')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .alter()
    table.uuid('skill_id')
      .references('skill.id')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .alter()
    table.primary(['employee_id', 'skill_id'])
  })

  await knex.schema.alterTable('role__skill', (table) => {
    table.dropPrimary()
    table.dropForeign('role_id')
    table.dropForeign('skill_id')
  })
  await knex.schema.alterTable('role__skill', (table) => {
    table.uuid('role_id')
      .references('role.id')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .alter()
    table.uuid('skill_id')
      .references('skill.id')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .alter()
    table.primary(['role_id', 'skill_id'])
  })

  await knex.schema.alterTable('assignment', (table) => {
    table.dropForeign('employee_id')
    table.dropForeign('role_id')
  })
  await knex.schema.alterTable('assignment', (table) => {
    table.uuid('role_id')
      .references('role.id')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .index()
      .alter()
    table.uuid('employee_id')
      .references('employee.id')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .index()
      .alter()
  })
}

exports.down = async (knex) => {
}

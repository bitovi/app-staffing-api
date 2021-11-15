exports.up = async (knex) => {
  await knex.schema.alterTable('role', (table) => {
    table
      .uuid('project_id')
      .references('project.id')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .index()
      .alter()
  })
}

exports.down = function (knex) {}

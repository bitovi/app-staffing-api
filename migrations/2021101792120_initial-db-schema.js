exports.up = async (knex) => {
    await knex.schema.createTable('skill', function (table) {
      table.string('id').notNullable()
      table.integer('name').notNullable()
    })
  }
  
  exports.down = async (knex) => {
    await knex.schema.dropTable('skill')
  }
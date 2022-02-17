exports.up = async function (knex) {
  await knex.schema.alterTable('role', function (table) {
    table.float('start_confidence').notNullable().alter()
    table.float('end_confidence').alter()
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('role', function (table) {
    table.integer('start_confidence').notNullable().alter()
    table.integer('end_confidence').alter()
  })
}

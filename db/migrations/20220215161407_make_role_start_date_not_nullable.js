
exports.up = async function (knex) {
  await knex.schema.alterTable('role', function (table) {
    table.timestamp('start_date').notNullable().alter()
    table.integer('start_confidence').notNullable().alter()
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('role', function (table) {
    table.timestamp('start_date').alter()
    table.integer('start_confidence').alter()
  })
}

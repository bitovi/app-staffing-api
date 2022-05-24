
exports.up = async function (knex) {
  await knex.schema.alterTable('role', function (table) {
    table.date('start_date').notNullable().alter()
    table.date('end_date').alter()
  })
  await knex.schema.alterTable('employee', function (table) {
    table.date('start_date').alter()
    table.date('end_date').alter()
  })
  await knex.schema.alterTable('assignment', function (table) {
    table.date('start_date').notNullable().alter()
    table.date('end_date').alter()
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('role', function (table) {
    table.timestamp('start_date').notNullable().alter()
    table.timestamp('end_date').alter()
  })
  await knex.schema.alterTable('employee', function (table) {
    table.timestamp('start_date').alter()
    table.timestamp('end_date').alter()
  })
  await knex.schema.alterTable('assignment', function (table) {
    table.timestamp('start_date').notNullable().alter()
    table.timestamp('end_date').alter()
  })
}

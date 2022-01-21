
exports.up = async function (knex) {
  await knex.schema.alterTable('project', function (table) {
    table.dropColumn('end_date')
    table.text('description')
  })
}

exports.down = async function (knex) {
  await knex.schema.alterTable('project', function (table) {
    table.timestamp('end_date')
    table.dropColumn('description')
  })
}

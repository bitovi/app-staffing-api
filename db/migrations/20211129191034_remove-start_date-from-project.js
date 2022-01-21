const tableName = 'project'
const columnName = 'start_date'

exports.up = async function (knex) {
  const hasColumn = await knex.schema.hasColumn(tableName, columnName)
  if (hasColumn) {
    await knex.schema.alterTable(tableName, table => {
      table.dropColumn(columnName)
    })
  } else {
    return null
  }
}

exports.down = async function (knex) {
  await knex.schema.alterTable(tableName, table => {
    table.timestamp(columnName).notNullable()
  })
}

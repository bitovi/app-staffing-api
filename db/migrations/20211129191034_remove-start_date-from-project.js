
exports.up = async (knex) => {
  const tableName = 'project'
  const columnName = 'start_date'
  const hasColumn = await knex.schema.hasColumn(tableName, columnName)
  if (hasColumn) {
    await knex.schema.alterTable(tableName, table => {
      table.dropColumn(columnName)
    })
  } else {
    return null
  }
}

exports.down = function (knex) {

}

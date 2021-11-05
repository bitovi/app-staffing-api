
const properties = {
  id: { type: 'string' },
  name: { type: 'string' },
  start_date: { type: 'date' },
  end_date: { type: 'date' }
}

const create = {
  $id: 'createEmployee',
  type: 'object',
  required: ['name'],
  properties,
  additionalProperties: false
}
const update = {
  $id: 'updateEmployee',
  type: 'object',
  properties,
  additionalProperties: false
}

module.exports = {
  properties,
  create,
  update
}


const properties = {
  id: { type: 'string' },
  name: { type: 'string' },
  start_date: { type: 'date' },
  end_date: { type: 'date' }
}

const create = {
  $id: 'createProject',
  type: 'object',
  required: ['name', 'start_date'],
  properties,
  additionalProperties: false
}
const update = {
  $id: 'updateProject',
  type: 'object',
  properties,
  additionalProperties: false
}

module.exports = {
  properties,
  create,
  update
}

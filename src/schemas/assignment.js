
const properties = {
  id: { type: 'string' },
  employee_id: { type: 'string' },
  role_id: { type: 'string' },
  start_date: { type: 'date' },
  end_date: { type: 'date' }
}

const create = {
  $id: 'createAssignment',
  type: 'object',
  required: ['employee_id', 'role_id', 'start_date'],
  properties,
  additionalProperties: false
}
const update = {
  $id: 'updateAssignment',
  type: 'object',
  properties,
  additionalProperties: false
}

module.exports = {
  properties,
  create,
  update
}

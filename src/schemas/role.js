
const properties = {
  id: { type: 'string', format: 'uuid' },
  start_date: { type: 'string' },
  start_confidence: { type: 'integer' },
  end_date: { type: 'string' },
  end_confidence: { type: 'integer' },
  project_id: { type: 'string' }
}

const create = {
  $id: 'createRole',
  type: 'object',
  required: ['project_id'],
  properties,
  additionalProperties: false
}
const update = {
  $id: 'updateRole',
  type: 'object',
  properties,
  additionalProperties: false
}

module.exports = {
  properties,
  create,
  update
}

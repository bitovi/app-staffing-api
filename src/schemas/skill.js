
const properties = {
  id: { type: 'string' },
  name: { type: 'string' }
}

const create = {
  $id: 'createSkill',
  type: 'object',
  required: ['name'],
  properties,
  additionalProperties: false
}
const update = {
  $id: 'updateSkill',
  type: 'object',
  properties,
  additionalProperties: false
}

module.exports = {
  properties,
  create,
  update
}

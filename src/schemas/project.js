module.exports = {
  $id: 'project',
  type: 'object',
  required: ['name', 'start_date'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    start_date: { type: 'string' },
    end_date: { type: 'string' }
  }
}
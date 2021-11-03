const JSONAPISerializer = require('json-api-serializer')
const Serializer = new JSONAPISerializer()

exports.Serializer = Serializer

Serializer.register('employee', {
  id: 'id'
})

Serializer.register('role', {
  id: 'id',
  start_date: 'start_date',
  start_confidence: 'start_confidence',
  end_date: 'end_date',
  end_confidence: 'end_confidence',
  project_id: 'project_id'
})

Serializer.register('skills', {
  id: 'id',
  name: 'name'
})

Serializer.register('project', {
  id: 'id',
  name: 'name',
  start_date: 'start_date',
  end_date: 'end_date'
})

const JSONAPISerializer = require('json-api-serializer')
const Serializer = new JSONAPISerializer()

exports.Serializer = Serializer

Serializer.register('employee', {
  id: 'id'
})

Serializer.register('role', {
  id: 'id'
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

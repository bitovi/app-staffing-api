const JSONAPISerializer = require('json-api-serializer')
const Serializer = new JSONAPISerializer()

exports.Serializer = Serializer

Serializer.register('employee', {
  id: 'id'
})

Serializer.register('role', {
  id: 'id',
  relationships: {
    skills: {
      type: 'skills'
    },
    assignments: {
      type: 'assignments'
    },
    employees: {
      type: 'employee'
    }
  }
})

Serializer.register('skills', {
  id: 'id'
})

Serializer.register('assignments', {
  id: 'id'
})

Serializer.register('project', {
  id: 'id'
})

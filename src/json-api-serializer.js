const JSONAPISerializer = require('json-api-serializer')
const Serializer = new JSONAPISerializer()

exports.Serializer = Serializer

Serializer.register('employees', {
  id: 'id',
  relationships: {
    roles: { type: 'roles' },
    skills: {
      type: 'skills',
      deserialize: (data) => {
        if (data) {
          const { id } = data
          return { id }
        }
        return data
      }
    }
  }
})

Serializer.register('roles', {
  id: 'id',
  relationships: {
    assignments: { type: 'assignments' },
    projects: { type: 'projects' },
    skills: { type: 'skills' },
    employees: { type: 'employees' }
  }
})

Serializer.register('skills', {
  id: 'id',
  relationships: {
    employees: { type: 'employees' },
    roles: { type: 'roles' }
  }
})

Serializer.register('projects', {
  id: 'id',
  relationships: {
    roles: { type: 'roles' }
  }
})

Serializer.register('assignments', {
  id: 'id',
  relationships: {
    employees: { type: 'employees' },
    roles: { type: 'roles' }
  }
})

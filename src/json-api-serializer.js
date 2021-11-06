const JSONAPISerializer = require('json-api-serializer')
const Serializer = new JSONAPISerializer()

exports.Serializer = Serializer

const topLevelLinksfn = ({ page, pageSize, count }) => {
  page = parseInt(page)
  const lastPage = (Math.round(count / pageSize) - 1)
  const hasPages = page < lastPage
  const isLastPage = page === lastPage
  const isFirstPage = page === 0
  const hasNextPage = count > pageSize && !isLastPage

  return {
    first: !isFirstPage ? `/employees?page[number]=0&page[size]=${pageSize}` : null,
    last: hasNextPage && !isFirstPage ? `/employees?page[number]=${lastPage}&page[size]=${pageSize}` : null,
    next: hasPages && hasNextPage ? `/employees?page[number]=${page + 1}&page[size]=${pageSize}` : null,
    prev: !isFirstPage ? `/employees?page[number]=${page - 1}&page[size]=${pageSize}` : null
  }
}

const deserialize = (data) => {
  if (data) {
    const { id } = data
    return { id }
  }
  return data
}

Serializer.register('employees', {
  id: 'id',
  relationships: {
    roles: { type: 'roles', deserialize },
    skills: { type: 'skills', deserialize }
  },
  topLevelLinks: topLevelLinksfn
})

Serializer.register('roles', {
  id: 'id',
  relationships: {
    assignments: { type: 'assignments', deserialize },
    projects: { type: 'projects', deserialize },
    skills: { type: 'skills', deserialize },
    employees: { type: 'employees', deserialize }
  },
  topLevelLinks: topLevelLinksfn
})

Serializer.register('skills', {
  id: 'id',
  relationships: {
    roles: { type: 'roles', deserialize },
    employees: { type: 'employees', deserialize }
  },
  topLevelLinks: topLevelLinksfn
})

Serializer.register('projects', {
  id: 'id',
  relationships: {
    roles: { type: 'roles', deserialize }
  },
  topLevelLinks: topLevelLinksfn
})

Serializer.register('assignments', {
  id: 'id',
  relationships: {
    employees: { type: 'employees', deserialize },
    roles: { type: 'roles', deserialize }
  },
  topLevelLinks: topLevelLinksfn
})

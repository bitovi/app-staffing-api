const JSONAPISerializer = require('json-api-serializer')
const Serializer = new JSONAPISerializer()

exports.Serializer = Serializer

const buildPagingUrl = (urlParts, params, number) => {
  if (params.has('page[number]')) {
    params.set('page[number]', number)
  }

  return urlParts[0] + '?' + decodeURIComponent(params.toString())
}
// @TODO: fix paging for page > lastPage
const topLevelLinksfn = ({ page, pageSize, count, url }) => {
  const lastPage = (Math.round(count / pageSize) - 1)
  const hasPages = page < lastPage
  const isLastPage = page === lastPage
  const isFirstPage = page === 0
  const hasNextPage = (count > (pageSize * (page + 1))) && !isLastPage
  const urlParts = url.split('?')
  const query = urlParts[1] || ''
  const params = new URLSearchParams(query)

  return {
    self: url,
    first: !isFirstPage ? buildPagingUrl(urlParts, params, 0) : null,
    last: hasNextPage && !isLastPage ? buildPagingUrl(urlParts, params, lastPage) : null,
    next: hasPages && hasNextPage ? buildPagingUrl(urlParts, params, page + 1) : null,
    prev: !isFirstPage ? buildPagingUrl(urlParts, params, page - 1) : null
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
    skills: { type: 'skills', deserialize },
    assignments: { type: 'employees', deserialize }
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
    roles: { type: 'roles', deserialize },
    assignments: { type: 'assignments', deserialize }
  },
  topLevelLinks: topLevelLinksfn
})

Serializer.register('assignments', {
  id: 'id',
  relationships: {
    employees: { type: 'employees', deserialize },
    roles: { type: 'roles', deserialize },
    projects: { type: 'projects', deserialize }
  },
  topLevelLinks: topLevelLinksfn
})

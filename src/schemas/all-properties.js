const assignmentProperties = require('./assignment').properties
const employeeProperties = require('./employee').properties
const projectProperties = require('./project').properties
const roleProperties = require('./role').properties
const skillProperties = require('./skill').properties

const properties = {
  assignment: Object.keys(assignmentProperties),
  employee: Object.keys(employeeProperties),
  project: Object.keys(projectProperties),
  role: Object.keys(roleProperties),
  skill: Object.keys(skillProperties)
}

const modelHasColumn = (normalizedName) => {
  if (Array.isArray(normalizedName)) {
    return normalizedName.every(el => modelHasColumn(el))
  }
  const [modelName, columnName] = normalizedName.split('.')
  return (properties[modelName] && properties[modelName].includes(columnName))
}

module.exports = modelHasColumn

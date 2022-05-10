const faker = require('faker')

const dateGenerator = function () {
  const start = faker.date.past()
  const end = faker.date.future()
  const midpoint = faker.date.between(start, end)
  const startAssignmentDate = faker.date.between(start, midpoint)
  const endAssignmentDate = faker.date.between(midpoint, end)
  const toDateFormat = (d) => {
    return `${d.getFullYear()}-${d.getMonth() === 0 ? d.getMonth() + 1 : d.getMonth()}-${d.getDay() === 0 ? d.getDay() + 1 : d.getDay()}`
  }
  const x = {
    startDate: toDateFormat(start),
    endDate: toDateFormat(end),
    beforeRoleStartDate: toDateFormat(faker.date.past(1, start)),
    afterRoleEndDate: toDateFormat(faker.date.future(1, end)),
    startAssignmentDate: toDateFormat(startAssignmentDate),
    endAssignmentDate: toDateFormat(endAssignmentDate),
    startBeforeAssignmentDate: toDateFormat(faker.date.between(start, startAssignmentDate)),
    endAfterAssignmentDate: toDateFormat(faker.date.between(endAssignmentDate, end))
  }
  console.log(x)
  return x
}

module.exports = {
  dateGenerator
}

const faker = require('faker')
/*
Function that returns an Object that includes a range of dates as follows:
  beforeStartDate->startDate->startBeforeAssignmentDate->endAssignmentDate->endAfterAssignmentDate->endDate->afterEndDate
*/
const dateGenerator = function () {
  // ref is used in start to ensure that startDate and endDate will never overlap
  const ref = new Date('2020-01-01')
  const start = faker.date.past(10, ref)
  const end = faker.date.future(10)
  // midpoint creates a midpoint between startDate and endDate so that the assignment dates do not overlap
  const midpoint = faker.date.between(start, end)
  const startAssignmentDate = faker.date.between(start, midpoint)
  const endAssignmentDate = faker.date.between(midpoint, end)
  // Formats the date to 'YYYY-MM-DD' and if the offset parameter is passed in, adds the offset to the day to avoid overlap
  const toDateFormat = (date, offset = false) => {
    return `${date.getFullYear() + 1}-${date.getMonth() + 1}-${offset ? date.getDay() + offset : date.getDay() + 1}`
  }
  return {
    beforeStartDate: toDateFormat(faker.date.past(5, new Date(start.setFullYear(start.getFullYear() - 1)))),
    startDate: toDateFormat(start),
    startBeforeAssignmentDate: toDateFormat(faker.date.between(start, startAssignmentDate)),
    startAssignmentDate: toDateFormat(startAssignmentDate),
    endAssignmentDate: toDateFormat(endAssignmentDate),
    endAfterAssignmentDate: toDateFormat(faker.date.between(endAssignmentDate, end), 3),
    endDate: toDateFormat(end, 5),
    afterEndDate: toDateFormat(faker.date.future(5, new Date(end.setFullYear(end.getFullYear() + 1))))
  }
}

module.exports = {
  dateGenerator
}

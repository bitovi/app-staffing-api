const Employee = require('../../src/models/employee')
const Skill = require('../../src/models/skill')
const { routeTestHarness } = require('./route-test-harness')

// Skills
const insertSkillPayloads = [
  {
    name: 'Node'
  },
  {
    name: 'Angular'
  }
]
routeTestHarness('/skills', Skill, insertSkillPayloads)

// Employees
const insertEmployeePayloads = [
  {
    name: 'Michael Scott'
  },
  {
    name: 'Dwight Schrute'
  }
]
routeTestHarness('/employees', Employee, insertEmployeePayloads)

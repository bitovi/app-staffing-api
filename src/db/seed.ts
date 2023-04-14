import { Scaffold } from "bitscaffold";
import Chance from 'chance'

import { dateGenerator } from '../utils/date'

const chance = new Chance()
const NUMBER_OF_RECORDS_TO_INSERT = 15

const seedData = async (scaffold: Scaffold) => {
    await scaffold.model['Project'].destroy({where: {}});
    await scaffold.model['Assignment'].destroy({where: {}});
    await scaffold.model['Employee'].destroy({where: {}});
    await scaffold.model['Role'].destroy({where: {}});
    await scaffold.model['Skill'].destroy({where: {}});


    const skillIds = await createSkills(scaffold);
    const projectIds = await createProject(scaffold);
    const roleIds = await createRole(scaffold, projectIds, skillIds);
    const employeeIds = await createEmployee(scaffold, skillIds);
    await createAssignment(scaffold, employeeIds, roleIds);
};

async function createSkills (scaffold: Scaffold) {
    const skillList = [
      { name: 'Product Design' },
      { name: 'Project Management' },
      { name: 'React' },
      { name: 'Angular' },
      { name: 'Backend' },
      { name: 'DevOps' }
    ]
    const skills = await scaffold.model['Skill'].bulkCreate(skillList);
    const idList: Array<string> = []
    skills.forEach((e: any) => {
      idList.push(e.id)
    })
    return idList
}

async function createProject (scaffold: Scaffold) {    
    const projectList: Array<any> = []; 
    for (let index = 0; index < NUMBER_OF_RECORDS_TO_INSERT; index++) {
      projectList.push(
        {
          name: chance.word(),
          description: chance.sentence()
        }
        )
      }
    const idList: Array<string> = [];
      const projects = await scaffold.model['Project'].bulkCreate(projectList);
      projects.forEach((e: any) => {
        idList.push(e.id)
      })
      return idList
}

async function createRole(scaffold, projectIds: Array<string>, skillIds: Array<string>) {
    const roleList: Array<any> = [];
    for (let index = 0; index < NUMBER_OF_RECORDS_TO_INSERT; index++) {
      const dates = dateGenerator()
      roleList.push(
        {
          name: chance.word(),
          start_confidence: chance.floating({ min: 0, max: 1 }),
          end_confidence: chance.floating({ min: 0, max: 1 }),
          start_date: dates.startDate,
          end_date: dates.beforeStartDate,
          project: {
            id: projectIds[chance.integer({min: 0, max: 14})]
          },
          skills: [
            {
              id: skillIds[chance.integer({min: 0, max: 5})]
            }
          ]
        }
        )
      }
    const idList: Array<string> = [];
    const roles = await scaffold.model['Role'].bulkCreate(roleList);
    roles.forEach((e: any) => {
      idList.push(e.id)
    })
    return idList
}

async function createEmployee(scaffold: Scaffold, skillIds: Array<string> ) {
  const employeeList: Array<any> = [];
  for (let index = 0; index < NUMBER_OF_RECORDS_TO_INSERT; index++) {
    const dates = dateGenerator();
    employeeList.push({
      name: chance.name(),
      start_date: dates.startDate,
      end_date: dates.endDate,
      skills: [
        {
          id: skillIds[chance.integer({min: 0, max: 5})]
        }
      ]
    })
  }
  const idList: Array<string> = [];
  const employees = await scaffold.model['Employee'].bulkCreate(employeeList);
  employees.forEach((e: any) => {
    idList.push(e.id)
  })
  return idList
}

async function createAssignment(scaffold: Scaffold, employeeIds: Array<string>, roleIds: Array<string>) {
  const assignmentList: Array<any> = [];
  for (let index = 0; index < NUMBER_OF_RECORDS_TO_INSERT; index++) {
    const dates = dateGenerator();
    assignmentList.push({
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employeeIds[index] },
      role: { id: roleIds[index] }
    })
  }
  const idList: Array<string> = [];
  const assignment = await scaffold.model['Assignment'].bulkCreate(assignmentList);
  assignment.forEach((e: any) => {
    idList.push(e.id)
  })
  return idList
}

export default seedData;
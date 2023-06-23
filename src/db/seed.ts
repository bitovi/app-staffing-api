import type { Hatchify } from "@hatchifyjs/koa"
import Chance from "chance"

import { dateGenerator } from "../utils/date"

const chance = new Chance()
const NUMBER_OF_RECORDS_TO_INSERT = 10

let dateCache: ReturnType<typeof dateGenerator>

const seedData = async (hatchify: Hatchify) => {
  await hatchify.model["Project"].destroy({ where: {} })
  await hatchify.model["Assignment"].destroy({ where: {} })
  await hatchify.model["Employee"].destroy({ where: {} })
  await hatchify.model["Role"].destroy({ where: {} })
  await hatchify.model["Skill"].destroy({ where: {} })

  const skillIds = await createSkills(hatchify)
  const projectIds = await createProject(hatchify)
  const roleIds = await createRole(hatchify, projectIds, skillIds)
  const employeeIds = await createEmployee(hatchify, skillIds)
  await createAssignment(hatchify, employeeIds, roleIds)
}

async function createSkills(hatchify: Hatchify) {
  const skillList = [
    { name: "Product Design" },
    { name: "Project Management" },
    { name: "React" },
    { name: "Angular" },
    { name: "Backend" },
    { name: "DevOps" },
  ]
  const skills = await hatchify.model["Skill"].bulkCreate(skillList)
  const idList: string[] = []
  skills.forEach((e: any) => {
    idList.push(e.id)
  })
  return idList
}

async function createProject(hatchify: Hatchify) {
  const projectList: any[] = []
  for (let index = 0; index < NUMBER_OF_RECORDS_TO_INSERT; index++) {
    projectList.push({
      name: chance.word(),
      description: chance.sentence(),
    })
  }
  const idList: string[] = []
  const projects = await hatchify.model["Project"].bulkCreate(projectList)
  projects.forEach((e: any) => {
    idList.push(e.id)
  })
  return idList
}

async function createRole(hatchify, projectIds: string[], skillIds: string[]) {
  const roleList: any[] = []
  for (let index = 0; index < NUMBER_OF_RECORDS_TO_INSERT; index++) {
    const dates = dateGenerator()
    dateCache = dates
    roleList.push({
      start_confidence: chance.integer({ min: 0, max: 10 }) / 10,
      end_confidence: chance.integer({ min: 0, max: 10 }) / 10,
      start_date: dates.startDate,
      end_date: dates.endDate,
      project: {
        id: projectIds[index],
      },
      skills: [
        {
          id: skillIds[chance.integer({ min: 0, max: 5 })],
        },
      ],
    })
  }
  const idList: string[] = []
  const roles = await hatchify.model["Role"].bulkCreate(roleList)
  roles.forEach((e: any) => {
    idList.push(e.id)
  })
  return idList
}

async function createEmployee(hatchify: Hatchify, skillIds: string[]) {
  const employeeList: any[] = []
  for (let index = 0; index < NUMBER_OF_RECORDS_TO_INSERT; index++) {
    const dates = dateCache
    employeeList.push({
      name: chance.name(),
      start_date: dates.startDate,
      end_date: dates.endDate,

      skills: [
        {
          id: skillIds[chance.integer({ min: 0, max: 5 })],
        },
      ],
    })
  }
  const idList: string[] = []
  const employees = await hatchify.model["Employee"].bulkCreate(employeeList)
  employees.forEach((e: any) => {
    idList.push(e.id)
  })
  return idList
}

async function createAssignment(
  hatchify: Hatchify,
  employeeIds: string[],
  roleIds: string[],
) {
  const assignmentList: any[] = []
  for (let index = 0; index < NUMBER_OF_RECORDS_TO_INSERT; index++) {
    const dates = dateCache
    assignmentList.push({
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employeeIds[index] },
      role: { id: roleIds[index] },
    })
  }
  const idList: string[] = []
  const assignment = await hatchify.model["Assignment"].bulkCreate(
    assignmentList,
  )
  assignment.forEach((e: any) => {
    idList.push(e.id)
  })
  return idList
}

export default seedData

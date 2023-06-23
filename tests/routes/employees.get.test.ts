import Chance from "chance"
import request from "supertest"

import { dateGenerator } from "../../src/utils/date"

describe("GET /api/employees", () => {
  const chance = new Chance()

  const get = async (url: string) => {
    const response = await request(global.app.callback())
      .get(url)
      .set("Accept", "application/vnd.api+json")
      .set("Content-Type", "application/vnd.api+json")

    return response
  }

  it("should HMMMM", async function () {
    const { Assignment, Employee, Project, Role } = global.model

    const dates = dateGenerator()

    const projectName = chance.word()

    const project: any = await Project.create({
      name: projectName,
    })

    const employee = await Employee.create({
      name: chance.name(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    })

    const role = await Role.create({
      start_date: dates.past,
      start_confidence: chance.floating({ min: 0, max: 0.9 }),
      end_date: dates.endDate,
      end_confidence: chance.floating({ min: 0, max: 0.9 }),
      project_id: project.id,
    })

    await Assignment.create({
      start_date: dates.startDate,
      end_date: dates.endDate,
      employee_id: employee.id,
      role_id: role.id,
    })

    const { body, statusCode } = await get(
      `/api/employees/${employee.id}?fields[employees]=currentProject&include=assignments.role.project`,
    )

    expect(statusCode).toEqual(200)
    expect(body.data.type).toEqual("Employee")
    expect(body.data.attributes.currentProject).toStrictEqual({
      id: project.id,
      name: projectName,
    })
  })
})

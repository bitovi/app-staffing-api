import Chance from "chance"
import request from "supertest"

import { dateGenerator } from "../../src/utils/date"
import Serializer from "../../src/utils/json-api-serializer"
import { isString } from "../../src/utils/validation"

const chance = new Chance()

const serialize = (body) => {
  return Serializer.serialize("employees", body)
}

const post = async (payload) => {
  const response = await request(global.app.callback())
    .post("/api/employees")
    .set("Accept", "application/vnd.api+json")
    .set("Content-Type", "application/vnd.api+json")
    .send(serialize(payload))

  return response
}

describe("POST /api/employees", () => {
  it("should return 200 for valid employee with skills payload", async function () {
    const { Employee, Skill } = global.model

    const dates = dateGenerator()

    // create some skills records
    const skills = await Skill.bulkCreate(
      chance
        .sentence({ words: 3 })
        .split(" ")
        .map((word, index) => {
          return { name: word + index }
        }),
    )

    const employee = {
      name: chance.name(),
      start_date: dates.startDate,
      end_date: dates.endDate,
      skills: skills.map((skill) => skill.dataValues.id),
    }

    const { body, statusCode } = await post(employee)

    expect(statusCode).toBe(200)
    expect(isString(body.data.id)).toBe(true)

    const savedEmployee = await Employee.findByPk(body.data.id)

    expect(savedEmployee.name).toBe(employee.name)
  })
})

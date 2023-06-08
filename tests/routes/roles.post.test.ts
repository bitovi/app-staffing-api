import Chance from "chance"
import request from "supertest"

import { dateGenerator } from "../../src/utils/date"
import Serializer from "../../src/utils/json-api-serializer"
import { isString } from "../../src/utils/validation"

const chance = new Chance()

const serialize = (body) => {
  return Serializer.serialize("roles", body)
}

const post = async (payload) => {
  const response = await request(global.app.callback())
    .post("/api/roles")
    .set("Accept", "application/vnd.api+json")
    .set("Content-Type", "application/vnd.api+json")
    .send(serialize(payload))

  return response
}

describe("POST /Role", function () {
  it("should return 422 if payload is missing start_date", async function () {
    const { statusCode } = await post({
      start_confidence: chance.floating({ min: 0, max: 1 }),
      project: { id: chance.guid() },
    })

    expect(statusCode).toBe(422)
  })

  it("should return 422 if payload is missing start_confidence", async function () {
    const dates = dateGenerator()

    const payload = serialize({
      start_date: dates.startDate,
      project: { id: chance.guid() },
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(422)
  })

  it("should return 200 for valid payload", async function () {
    const { Project, Role } = global.model

    const dates = dateGenerator()

    const project = await Project.create({
      name: chance.company(),
      description: chance.sentence(),
    })

    const newRole = {
      start_date: dates.startDate,
      name: chance.word(),
      start_confidence: chance.floating({ min: 0, max: 1 }),
      project: { id: project.dataValues.id },
    }

    const { body, statusCode } = await post(newRole)

    expect(statusCode).toBe(200)

    expect(isString(body.data.id)).toEqual(true)

    const savedRole = await Role.findByPk(body.data.id)
    // expect(savedRole.project_id).toEqual(newRole.project.id)
    expect(savedRole.start_confidence).toEqual(newRole.start_confidence)
  })

  it("should return 200 for valid payload with skills", async function () {
    const { Project, Role } = global.model

    const dates = dateGenerator()

    const project = await Project.create({
      name: chance.company(),
      description: chance.sentence(),
    })

    const newRole = {
      start_date: dates.startDate,
      name: chance.word(),
      start_confidence: chance.floating({ min: 0, max: 1 }),
      project_id: project.id,
    }

    const { body, statusCode } = await post(newRole)
    expect(statusCode).toBe(200)

    expect(isString(body.data.id)).toEqual(true)

    const savedRole = await Role.findByPk(body.data.id)
    expect(savedRole.start_confidence).toEqual(newRole.start_confidence)
  })

  it("should return 422 for payload with startDate after endDate", async function () {
    const { Project, Skill } = global.model

    const dates = dateGenerator()

    const project = await Project.create({
      name: chance.company(),
      description: chance.sentence(),
    })

    const skill = await Skill.create({
      name: chance.word(),
    })

    const newRole = {
      start_date: dates.startDate,
      start_confidence: chance.floating({ min: 0, max: 1 }),
      end_date: dates.beforeStartDate,
      end_confidence: chance.floating({ min: 0, max: 1 }),
      project: { id: project.id },
      skills: [skill],
    }
    const payload = serialize(newRole)
    const response = await post(payload)
    expect(response.statusCode).toBe(422)
  })
})

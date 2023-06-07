import Chance from "chance"
import request from "supertest"

import { dateGenerator } from "../../src/utils/date"
import Serializer from "../../src/utils/json-api-serializer"

const chance = new Chance()

describe("PUT /api/roles/:id", function () {
  const put = async (id, payload) => {
    const response = await request(global.app.callback())
      .put(`/api/roles/${id}`)
      .set("Accept", "application/vnd.api+json")
      .set("Content-Type", "application/vnd.api+json")
      .send(serialize(payload))

    return response
  }

  const serialize = (body) => {
    return Serializer.serialize("roles", body)
  }

  it("should return 200 if update is successful", async function () {
    const { Role } = global.model

    const dates = dateGenerator()

    const roleData = {
      start_date: dates.startDate,
      end_date: dates.endDate,
      start_confidence: chance.floating({ min: 0, max: 1 }),
      end_confidence: chance.floating({ min: 0, max: 1 }),
    }

    const role = await Role.create(roleData)

    const { statusCode } = await put(role.id, { start_confidence: 0.3 })
    expect(statusCode).toEqual(200)

    const updatedRole = await Role.findByPk(role.id)

    expect(updatedRole.dataValues.start_confidence).toEqual(0.3)
  })

  it("should allow end_date / end_confidence updates to null", async function () {
    const { Project, Role } = global.model

    const dates = dateGenerator()
    const project = await Project.create({
      name: chance.company(),
      description: chance.sentence(),
    })

    const roleData = {
      start_date: dates.startDate,
      end_date: dates.endDate,
      start_confidence: chance.floating({ min: 0, max: 1 }),
      end_confidence: chance.floating({ min: 0, max: 1 }),
      project_id: project.id,
    }

    const role = await Role.create(roleData)

    const response = await put(role.id, {
      end_date: null,
      end_confidence: null,
    })

    expect(response.statusCode).toEqual(200)

    const updatedRole = await Role.findByPk(role.id)

    expect(updatedRole.dataValues.end_date).toBeNull()
    expect(updatedRole.dataValues.end_confidence).toBeNull()
  })

  it("should return 422 for payload with startDate after endDate", async function () {
    const { Role } = global.model

    const dates = dateGenerator()

    const roleData = {
      name: chance.word(),
      start_date: dates.startDate,
      end_date: dates.endDate,
      start_confidence: chance.floating({ min: 0, max: 1 }),
      end_confidence: chance.floating({ min: 0, max: 1 }),
    }

    const role = await Role.create(roleData)

    const response = await put(role.id, {
      start_date: dates.endDate,
      end_date: dates.startDate,
    })
    expect(response.statusCode).toEqual(422)
  })
})

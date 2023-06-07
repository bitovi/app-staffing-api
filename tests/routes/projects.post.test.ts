import Chance from "chance"
import request from "supertest"

import Serializer from "../../src/utils/json-api-serializer"

const chance = new Chance()

const serialize = (body) => {
  return Serializer.serialize("projects", body)
}

const post = async (payload) => {
  const response = await request(global.app.callback())
    .post("/api/projects")
    .set("Accept", "application/vnd.api+json")
    .set("Content-Type", "application/vnd.api+json")
    .send(serialize(payload))

  return response
}

describe("POST /api/projects", function () {
  it("should return 200 and create project with description", async function () {
    const { Project } = global.model

    const project = {
      name: chance.word(),
      description: chance.sentence(),
    }

    const { statusCode, body } = await post(project)
    expect(statusCode).toBe(200)

    const dbProject = await Project.findByPk(body.data.id)

    expect(dbProject.name).toEqual(project.name)
    expect(dbProject.description).toEqual(project.description)
  })
})

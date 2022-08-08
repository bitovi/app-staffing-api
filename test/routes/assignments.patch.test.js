const faker = require("faker");
const { transaction, Model } = require("objection");

const Role = require("../../src/models/role");
const Project = require("../../src/models/project");
const Employee = require("../../src/models/employee");
const Assignment = require("../../src/models/assignment");
const { Serializer } = require("../../src/json-api-serializer");
const { dateGenerator } = require("../../src/utils/date-utils");

describe("PATCH /assignments/:id", function () {
  let trx;
  const knex = Model.knex();

  beforeEach(async () => {
    trx = await transaction.start(knex);
    Model.knex(trx);
  });

  afterEach(async () => {
    await trx.rollback();
    Model.knex(knex);
  });

  test("should return 404 if assignment id does not exist", async function () {
    const dates = dateGenerator();
    const notFoundId = faker.datatype.uuid();
    const payload = serialize({
      id: notFoundId,
      start_date: dates.startDate,
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() },
    });
    const response = await patch(notFoundId, payload);
    expect(response.statusCode).toBe(404);
  });

  test("should return 409 if associated employee does not exist", async function () {
    const dates = dateGenerator();

    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1 }),
      end_date: dates.endDate,

      end_confidence: faker.datatype.float({ min: 0, max: 1 }),
      project_id: project.id,
    });

    const assignment = await Assignment.query().insertGraph(
      {
        start_date: dates.startAssignmentDate,
        employee: { id: employee.id },
        role: { id: role.id },
      },
      { relate: true }
    );

    const payload = serialize({
      employee: { id: faker.datatype.uuid() },
      role: {
        id: role.id,
      },
      start_date: dates.startBeforeAssignmentDate,
      end_date: null,
    });

    const response = await patch(assignment.id, payload);

    expect(response.statusCode).toBe(409);
  });

  test("should return 422 if payload has unknown fields", async function () {
    const dates = dateGenerator();
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1 }),
      end_date: dates.endDate,

      end_confidence: faker.datatype.float({ min: 0, max: 1 }),
      project_id: project.id,
    });

    const assignment = await Assignment.query().insertGraph(
      {
        start_date: dates.startAssignmentDate,
        employee: { id: employee.id },
        role: { id: role.id },
      },
      { relate: true }
    );

    const payload = serialize({ anUnknownProperty: "foo bar baz" });
    const response = await patch(assignment.id, payload);
    expect(response.statusCode).toBe(422);

    const { detail } = JSON.parse(response.body).errors[0];
    expect(detail).toBe("body should NOT have additional properties");
  });
  test("should return 422 for payload with startDate after endDate", async function () {
    const dates = dateGenerator();

    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });
    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });
    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1 }),
      end_date: dates.endDate,
      end_confidence: faker.datatype.float({ min: 0, max: 1 }),
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const assignment = await Assignment.query().insertGraph(newAssignment, {
      relate: true,
    });

    const payload = serialize({
      ...newAssignment,
      start_date: dates.endAssignmentDate,
      end_date: dates.startAssignmentDate,
    });
    const response = await patch(assignment.id, payload);

    expect(response.statusCode).toBe(422);
  });
  test("should update optional end_date to null", async function () {
    const dates = dateGenerator();
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1 }),
      end_date: dates.endDate,
      end_confidence: faker.datatype.float({ min: 0, max: 1 }),
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const assignment = await Assignment.query().insertGraph(newAssignment, {
      relate: true,
    });

    const payload = serialize({ ...newAssignment, end_date: null });

    const response = await patch(assignment.id, payload);

    expect(response.statusCode).toBe(200);
    const responseBody = deserialize(JSON.parse(response.body));
    expect(responseBody.end_date).toBeNull();
  });

  test("should return 200 when update is successful", async function () {
    const dates = dateGenerator();

    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1 }),
      end_date: dates.endDate,
      end_confidence: faker.datatype.float({ min: 0, max: 1 }),
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,

      employee: { id: employee.id },
      role: { id: role.id },
    };
    const assignment = await Assignment.query().insertGraph(newAssignment, {
      relate: true,
    });

    const newAssociatedEmployee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
    });
    const payload = serialize({
      ...newAssignment,
      employee: { id: newAssociatedEmployee.id },
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
    });
    const response = await patch(assignment.id, payload);

    expect(response.statusCode).toBe(200);
    const responseBody = deserialize(JSON.parse(response.body));
    expect(responseBody.employee.id).toEqual(newAssociatedEmployee.id);
  });
  test("should return 200 for payload dates out of range of role, assignment dates before roles and start date is not confident", async function () {
    const dates = dateGenerator();
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.afterEndDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 0.9 }),
      end_date: dates.endDate,
      end_confidence: faker.datatype.float({ min: 0, max: 0.9 }),
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const assignment = await Assignment.query().insertGraph(newAssignment, {
      relate: true,
    });

    const payload = serialize({
      ...newAssignment,
      start_date: dates.beforeStartDate,
      end_date: dates.endAssignmentDate,
    });
    const response = await patch(assignment.id, payload);

    expect(response.statusCode).toBe(200);
  });
  test("should return 200 for payload dates out of range of role, assignment dates after roles and end date is not confident", async function () {
    const dates = dateGenerator();
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 0.9 }),
      end_date: dates.endDate,
      end_confidence: faker.datatype.float({ min: 0, max: 0.9 }),
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const assignment = await Assignment.query().insertGraph(newAssignment, {
      relate: true,
    });

    const payload = serialize({
      ...newAssignment,
      start_date: dates.startAssignmentDate,
      end_date: dates.afterEndDate,
    });
    const response = await patch(assignment.id, payload);

    expect(response.statusCode).toBe(200);
  });

  test("should return 409 for payload dates out of range of role, assignment dates before roles and start date is fully confident", async function () {
    const dates = dateGenerator();
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.afterEndDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: 1,
      end_date: dates.endDate,
      end_confidence: faker.datatype.float({ min: 0, max: 1 }),
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const assignment = await Assignment.query().insertGraph(newAssignment, {
      relate: true,
    });

    const payload = serialize({
      ...newAssignment,
      start_date: dates.beforeStartDate,
      end_date: dates.endAssignmentDate,
    });
    const response = await patch(assignment.id, payload);

    expect(response.statusCode).toBe(409);
  });
  test("should return 409 for payload dates out of range of role, assignment dates after roles and end date is fully confident", async function () {
    const dates = dateGenerator();
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1 }),
      end_date: dates.endDate,
      end_confidence: 1,
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const assignment = await Assignment.query().insertGraph(newAssignment, {
      relate: true,
    });

    const payload = serialize({
      ...newAssignment,
      start_date: dates.startAssignmentDate,
      end_date: dates.afterEndDate,
    });
    const response = await patch(assignment.id, payload);

    expect(response.statusCode).toBe(409);
  });
  test("should return 409 for payload dates out of range of role, assignment start during role-ends after role", async function () {
    const dates = dateGenerator();
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 0.9 }),
      end_date: dates.endDate,
      end_confidence: 1,
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const assignment = await Assignment.query().insertGraph(newAssignment, {
      relate: true,
    });

    const payload = serialize({
      ...newAssignment,
      start_date: dates.beforeStartDate,
      end_date: dates.afterEndDate,
    });
    const response = await patch(assignment.id, payload);

    expect(response.statusCode).toBe(409);
  });
  function patch(id, payload) {
    return global.app.inject({
      method: "PATCH",
      url: `/assignments/${id}`,
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      payload: JSON.stringify(payload),
    });
  }
  function serialize(obj) {
    return Serializer.serialize("assignments", obj);
  }
  function deserialize(obj) {
    return Serializer.deserialize("assignments", obj);
  }
});

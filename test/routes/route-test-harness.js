function routeTestHarness (endpoint, model, insertPayloads) {
  describe(`Test the ${endpoint} endpoints`, () => {
    const recordsToCleanup = []

    afterEach(async () => {
      await model.query().whereIn('id', recordsToCleanup).delete()
    })

    // READ LIST
    test(`GET ${endpoint} (list)`, async () => {
      // insert using payloads
      const dbRecords = []
      for (const payload of insertPayloads) {
        const record = await model.query().insert(payload)
        dbRecords.push(record)
        recordsToCleanup.push(record.id)
      }

      // send request
      const response = await global.app.inject({
        url: endpoint,
        method: 'GET'
      })
      const result = JSON.parse(response.body)
      expect(response.statusCode).toEqual(200)

      const dbRecordCount = (await model.query().count())[0].count
      expect(result.data.length.toString()).toEqual(dbRecordCount)

      for (let i = 0; i < dbRecords.length; i++) {
        const payload = insertPayloads[i]
        const dbRecord = dbRecords[i]
        const apiRecord = result.data.find(s => s.id === dbRecord.id)

        expect(apiRecord).toBeTruthy()
        expect(apiRecord.id).toEqual(dbRecord.id)

        // assert fields were assigned appropriately
        for (const [key, value] of Object.entries(payload)) {
          expect(apiRecord.attributes[key]).toEqual(value)
        }
      }
    })
  })
}

exports.routeTestHarness = routeTestHarness

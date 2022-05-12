module.exports = {
  response: {
    list: {
      200: {
        jsonapi: {
          version: '1.0'
        },
        links: {
          self: '/employees'
        },
        data: [
          {
            type: 'employees',
            id: 'ca9b0052-af10-464f-8f03-af6c17915f16',
            attributes: {
              name: 'Verona Barton',
              start_date: '2022-01-18T11:02:17.905Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: '5381b801-01a2-47c9-9942-cf53aef168ac',
            attributes: {
              name: 'Lee Runolfsdottir',
              start_date: '2021-10-15T04:26:49.142Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: '320298a8-0c7f-4551-a651-23b259b574ea',
            attributes: {
              name: 'Larissa Runte',
              start_date: '2021-05-20T01:44:39.945Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: '56855737-fd1b-44aa-b204-1911c9ec6729',
            attributes: {
              name: 'Theresa Purdy',
              start_date: '2022-01-13T14:53:56.132Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: '7443d91c-24b1-49d8-a901-eb76e11161d9',
            attributes: {
              name: 'Joanne Kemmer',
              start_date: '2022-01-18T21:17:42.111Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: '2d7b478f-5605-4cfb-ac60-b1b07e547d59',
            attributes: {
              name: 'Eryn Wintheiser',
              start_date: '2021-06-15T02:02:44.101Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: 'f37f5efb-ba8e-4250-85b1-9317c35de10b',
            attributes: {
              name: 'Verdie Spencer',
              start_date: '2021-07-26T14:33:05.624Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: '8ba80826-bb8a-45c7-82ad-901d63189db8',
            attributes: {
              name: 'Sid Reynolds',
              start_date: '2021-12-07T00:47:24.157Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: '6b18b823-6fd7-4e49-98a5-e36b67266bfa',
            attributes: {
              name: 'Ethelyn Cruickshank',
              start_date: '2021-04-30T06:39:17.119Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: 'f937e8e0-93e4-494c-9f44-897653be4b3d',
            attributes: {
              name: 'Amy Rath',
              start_date: '2022-01-08T05:46:51.000Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: '2e877a8c-1808-46e0-92bc-3e503659d99c',
            attributes: {
              name: 'Eveline Cummerata',
              start_date: '2021-05-03T16:50:19.425Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: 'dd582655-7ea7-4dfb-9fe4-5fe1dc618564',
            attributes: {
              name: 'Micah Dietrich',
              start_date: '2021-10-21T11:35:42.331Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: 'e0a1bfb5-4219-4f7e-b773-079e40a5b9ec',
            attributes: {
              name: 'Jordyn Dach',
              start_date: '2022-01-28T13:38:36.484Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: '3aa22dd4-8a78-4ef2-ae08-351a52790116',
            attributes: {
              name: 'Rebeca Wisozk',
              start_date: '2021-05-13T16:02:51.517Z',
              end_date: null
            }
          },
          {
            type: 'employees',
            id: '714b2d18-e06e-487b-bd61-e044e3b935e5',
            attributes: {
              name: 'Khalid Schuster',
              start_date: '2021-06-07T00:49:15.669Z',
              end_date: null
            }
          }
        ]
      }
    },
    get: {
      200: {
        jsonapi: {
          version: '1.0'
        },
        links: {
          self: '/employees/5381b801-01a2-47c9-9942-cf53aef168ac'
        },
        data: {
          type: 'employees',
          id: '5381b801-01a2-47c9-9942-cf53aef168ac',
          attributes: {
            name: 'Lee Runolfsdottir',
            start_date: '2021-10-15T04:26:49.142Z',
            end_date: null
          }
        }
      },
      404: {
        errors: [
          {
            status: 404,
            code: 'not-found',
            message: 'Not found',
            source: {
              parameter: 'id'
            }
          }
        ]
      }
    },
    create: {
      201: {
        jsonapi: {
          version: '1.0'
        },
        links: {
          self: '/employees/3d2d0523-b0ab-4f31-a45c-095f68f2906d'
        },
        data: {
          type: 'employees',
          id: '3d2d0523-b0ab-4f31-a45c-095f68f2906d',
          attributes: {
            name: 'Joanne Kemmer',
            start_date: '2022-01-01T05:00:00.000Z',
            end_date: '2022-04-01T05:00:00.000Z'
          },
          relationships: {
            skills: {
              data: [
                {
                  type: 'skills',
                  id: '0350bd18-a1b6-4fd8-a6c8-24b4aa1e26e2'
                }
              ]
            }
          }
        }
      },
      409: {
        errors: [
          {
            status: 409,
            source: {},
            message: 'Foreign key constraint violation'
          }
        ]
      },
      422: {
        errors: [
          {
            status: 422,
            code: 'parameter-required',
            message: "should have required property 'name'",
            detail: "body should have required property 'name'",
            source: {
              pointer: '/data/attributes/name'
            }
          }
        ]
      }
    },
    patch: {
      200: {
        jsonapi: {
          version: '1.0'
        },
        links: {
          self: ''
        },
        data: {
          type: 'employees',
          id: 'b5bb33f3-6dd5-4e19-9df0-32d76c0edf08',
          attributes: {
            name: 'Rudy Leffler',
            start_date: '2022-01-01T05:00:00.000Z',
            end_date: '2022-04-01T05:00:00.000Z'
          },
          relationships: {
            skills: {
              data: [
                {
                  type: 'skills',
                  id: '0350bd18-a1b6-4fd8-a6c8-24b4aa1e26e2'
                }
              ]
            }
          }
        },
        included: [
          {
            type: 'skills',
            id: '0350bd18-a1b6-4fd8-a6c8-24b4aa1e26e2',
            attributes: {
              name: 'jewelery.js'
            }
          }
        ]
      },
      409: {
        errors: [
          {
            status: 409,
            source: {},
            message: 'Foreign key constraint violation'
          }
        ]
      },
      422: {
        errors: [
          {
            status: 422,
            code: 'invalid-parameter',
            detail: 'body should NOT have additional properties',
            source: {
              pointer: '/data/attributes/something'
            },
            message: 'something is an invalid parameter'
          }
        ]
      }
    },
    remove: {
      404: {
        errors: [
          {
            status: 404,
            code: 'not-found',
            message: 'Not found',
            source: {
              parameter: 'id'
            }
          }
        ]
      }
    }
  },
  request: {
    create: {
      data: {
        type: 'employees',
        attributes: {
          name: 'Joanne Kemmer',
          start_date: '2022-01-01T05:00:00.000Z',
          end_date: '2022-04-01T05:00:00.000Z',
          skills: [
            {
              id: '0350bd18-a1b6-4fd8-a6c8-24b4aa1e26e2'
            }
          ]
        }
      }
    },
    patch: {
      data: {
        type: 'employees',
        attributes: {
          name: 'Rudy Leffler',
          start_date: '2022-01-01T05:00:00.000Z',
          end_date: '2022-04-01T05:00:00.000Z',
          skills: [
            {
              id: '0350bd18-a1b6-4fd8-a6c8-24b4aa1e26e2'
            }
          ]
        }
      }
    }
  }
}

module.exports = {
  response: {
    list: {
      200: {
        jsonapi: {
          version: '1.0'
        },
        links: {
          self: '/skills'
        },
        data: [
          {
            type: 'skills',
            id: '26bc9580-c91f-43f6-a7dc-d1328e9b9a8a',
            attributes: {
              name: 'compressing.js'
            }
          },
          {
            type: 'skills',
            id: 'bea15166-2ae2-419a-85df-d0f85ab189ac',
            attributes: {
              name: 'business-focused.js'
            }
          },
          {
            type: 'skills',
            id: '85c5c350-767b-449a-a3ec-88ede29e1082',
            attributes: {
              name: 'palladium.js'
            }
          },
          {
            type: 'skills',
            id: 'f63fea55-588b-4dff-8616-0dad0f0c1d36',
            attributes: {
              name: 'compressing.js'
            }
          },
          {
            type: 'skills',
            id: '0ecacc0e-371e-4557-9747-c19cbac34689',
            attributes: {
              name: 'payment.js'
            }
          },
          {
            type: 'skills',
            id: 'f7059774-7838-4ffb-bb72-d4d8a0e926df',
            attributes: {
              name: 'radial.js'
            }
          },
          {
            type: 'skills',
            id: 'ec7a9d99-17c4-4f7a-aa05-6e64c03b0988',
            attributes: {
              name: 'scalable.js'
            }
          },
          {
            type: 'skills',
            id: '78401fc1-5592-4e65-92bd-82e063b0ce36',
            attributes: {
              name: 'upgradable.js'
            }
          },
          {
            type: 'skills',
            id: '97a72a37-4a97-4235-a6dc-d91916db142b',
            attributes: {
              name: 'cotton.js'
            }
          },
          {
            type: 'skills',
            id: '13b974b9-a076-4402-b3b5-17895932e065',
            attributes: {
              name: 'indexing.js'
            }
          },
          {
            type: 'skills',
            id: 'a15cf290-2501-4676-8600-58950b20d116',
            attributes: {
              name: 'market.js'
            }
          },
          {
            type: 'skills',
            id: '79ac7652-411e-45ec-8dc8-b0f512c784a9',
            attributes: {
              name: 'sticky.js'
            }
          },
          {
            type: 'skills',
            id: 'a3c59f40-c6e9-4636-8a4e-3d4bbfddc1f2',
            attributes: {
              name: 'haptic.js'
            }
          },
          {
            type: 'skills',
            id: '0350bd18-a1b6-4fd8-a6c8-24b4aa1e26e2',
            attributes: {
              name: 'jewelery.js'
            }
          },
          {
            type: 'skills',
            id: '7b700ef9-02a2-44b6-8f5d-8d57cfc90d87',
            attributes: {
              name: 'web.js'
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
          self: '/skills/26bc9580-c91f-43f6-a7dc-d1328e9b9a8a'
        },
        data: {
          type: 'skills',
          id: '26bc9580-c91f-43f6-a7dc-d1328e9b9a8a',
          attributes: {
            name: 'compressing.js'
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
          self: '/skills/44b2af55-7c47-424d-8e98-cce1d6ddb54c'
        },
        data: {
          type: 'skills',
          id: '44b2af55-7c47-424d-8e98-cce1d6ddb54c',
          attributes: {
            name: 'example skill'
          }
        }
      },
      409: {
        errors: [
          {
            status: 409,
            code: 'resource-conflict-occurred',
            source: {
              pointer: '/data/attributes/name'
            },
            message: 'Record with name already exists'
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
          type: 'skills',
          id: '996699c6-2988-46ff-a393-43882b641ca2',
          attributes: {
            name: 'Update example skill'
          }
        }
      },
      409: {
        errors: [
          {
            status: 409,
            code: 'resource-conflict-occurred',
            source: {
              pointer: '/data/attributes/name'
            },
            message: 'Record with name already exists'
          }
        ]
      },
      422: {
        errors: [
          {
            status: 422,
            code: 'invalid-parameter',
            message: 'nam is an invalid parameter',
            detail: 'body should NOT have additional properties',
            source: {
              pointer: '/data/attributes/nam'
            }
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
        type: 'skills',
        attributes: {
          name: 'example skill'
        }
      }
    },
    patch: {
      data: {
        type: 'skills',
        attributes: {
          name: 'Update example skill'
        }
      }
    }
  }
}

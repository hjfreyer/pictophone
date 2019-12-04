/* tslint:disable */
// generated by typescript-json-validator
import {inspect} from 'util';
import Ajv = require('ajv');
import Action from './Action';
export const ajv = new Ajv({"allErrors":true,"coerceTypes":false,"format":"fast","nullable":true,"unicode":true,"uniqueItems":true,"useDefaults":true});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

export {Action};
export const ActionSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "anyOf": [
    {
      "defaultProperties": [
      ],
      "properties": {
        "gameId": {
          "type": "string"
        },
        "kind": {
          "enum": [
            "join_game"
          ],
          "type": "string"
        },
        "playerId": {
          "type": "string"
        },
        "version": {
          "enum": [
            0
          ],
          "type": "number"
        }
      },
      "required": [
        "gameId",
        "kind",
        "playerId",
        "version"
      ],
      "type": "object"
    },
    {
      "defaultProperties": [
      ],
      "properties": {
        "gameId": {
          "type": "string"
        },
        "kind": {
          "enum": [
            "start_game"
          ],
          "type": "string"
        },
        "playerId": {
          "type": "string"
        },
        "version": {
          "enum": [
            0
          ],
          "type": "number"
        }
      },
      "required": [
        "gameId",
        "kind",
        "playerId",
        "version"
      ],
      "type": "object"
    },
    {
      "defaultProperties": [
      ],
      "properties": {
        "gameId": {
          "type": "string"
        },
        "kind": {
          "enum": [
            "make_move"
          ],
          "type": "string"
        },
        "playerId": {
          "type": "string"
        },
        "submission": {
          "anyOf": [
            {
              "defaultProperties": [
              ],
              "properties": {
                "kind": {
                  "enum": [
                    "word"
                  ],
                  "type": "string"
                },
                "word": {
                  "type": "string"
                }
              },
              "required": [
                "kind",
                "word"
              ],
              "type": "object"
            },
            {
              "defaultProperties": [
              ],
              "properties": {
                "drawingId": {
                  "type": "string"
                },
                "kind": {
                  "enum": [
                    "drawing"
                  ],
                  "type": "string"
                }
              },
              "required": [
                "drawingId",
                "kind"
              ],
              "type": "object"
            }
          ]
        },
        "version": {
          "enum": [
            0
          ],
          "type": "number"
        }
      },
      "required": [
        "gameId",
        "kind",
        "playerId",
        "submission",
        "version"
      ],
      "type": "object"
    },
    {
      "allOf": [
        {
          "defaultProperties": [
          ],
          "properties": {
            "gameId": {
              "type": "string"
            },
            "playerId": {
              "type": "string"
            },
            "version": {
              "enum": [
                "v1.1.0"
              ],
              "type": "string"
            }
          },
          "required": [
            "gameId",
            "playerId",
            "version"
          ],
          "type": "object"
        },
        {
          "defaultProperties": [
          ],
          "properties": {
            "displayName": {
              "minLength": 0,
              "type": "string"
            },
            "kind": {
              "enum": [
                "join_game"
              ],
              "type": "string"
            }
          },
          "required": [
            "displayName",
            "kind"
          ],
          "type": "object"
        }
      ]
    },
    {
      "allOf": [
        {
          "defaultProperties": [
          ],
          "properties": {
            "gameId": {
              "type": "string"
            },
            "playerId": {
              "type": "string"
            },
            "version": {
              "enum": [
                "v1.1.0"
              ],
              "type": "string"
            }
          },
          "required": [
            "gameId",
            "playerId",
            "version"
          ],
          "type": "object"
        },
        {
          "defaultProperties": [
          ],
          "properties": {
            "kind": {
              "enum": [
                "start_game"
              ],
              "type": "string"
            }
          },
          "required": [
            "kind"
          ],
          "type": "object"
        }
      ]
    },
    {
      "allOf": [
        {
          "defaultProperties": [
          ],
          "properties": {
            "gameId": {
              "type": "string"
            },
            "playerId": {
              "type": "string"
            },
            "version": {
              "enum": [
                "v1.1.0"
              ],
              "type": "string"
            }
          },
          "required": [
            "gameId",
            "playerId",
            "version"
          ],
          "type": "object"
        },
        {
          "defaultProperties": [
          ],
          "properties": {
            "kind": {
              "enum": [
                "make_move"
              ],
              "type": "string"
            },
            "submission": {
              "anyOf": [
                {
                  "defaultProperties": [
                  ],
                  "properties": {
                    "kind": {
                      "enum": [
                        "word"
                      ],
                      "type": "string"
                    },
                    "word": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "kind",
                    "word"
                  ],
                  "type": "object"
                },
                {
                  "defaultProperties": [
                  ],
                  "properties": {
                    "drawingId": {
                      "type": "string"
                    },
                    "kind": {
                      "enum": [
                        "drawing"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "drawingId",
                    "kind"
                  ],
                  "type": "object"
                }
              ]
            }
          },
          "required": [
            "kind",
            "submission"
          ],
          "type": "object"
        }
      ]
    },
    {
      "allOf": [
        {
          "defaultProperties": [
          ],
          "properties": {
            "gameId": {
              "type": "string"
            },
            "playerId": {
              "type": "string"
            },
            "version": {
              "enum": [
                "v1.2.0"
              ],
              "type": "string"
            }
          },
          "required": [
            "gameId",
            "playerId",
            "version"
          ],
          "type": "object"
        },
        {
          "defaultProperties": [
          ],
          "properties": {
            "displayName": {
              "minLength": 0,
              "type": "string"
            },
            "kind": {
              "enum": [
                "join_game"
              ],
              "type": "string"
            }
          },
          "required": [
            "displayName",
            "kind"
          ],
          "type": "object"
        }
      ]
    },
    {
      "allOf": [
        {
          "defaultProperties": [
          ],
          "properties": {
            "gameId": {
              "type": "string"
            },
            "playerId": {
              "type": "string"
            },
            "version": {
              "enum": [
                "v1.2.0"
              ],
              "type": "string"
            }
          },
          "required": [
            "gameId",
            "playerId",
            "version"
          ],
          "type": "object"
        },
        {
          "defaultProperties": [
          ],
          "properties": {
            "kind": {
              "enum": [
                "start_game"
              ],
              "type": "string"
            }
          },
          "required": [
            "kind"
          ],
          "type": "object"
        }
      ]
    },
    {
      "allOf": [
        {
          "defaultProperties": [
          ],
          "properties": {
            "gameId": {
              "type": "string"
            },
            "playerId": {
              "type": "string"
            },
            "version": {
              "enum": [
                "v1.2.0"
              ],
              "type": "string"
            }
          },
          "required": [
            "gameId",
            "playerId",
            "version"
          ],
          "type": "object"
        },
        {
          "defaultProperties": [
          ],
          "properties": {
            "kind": {
              "enum": [
                "make_move"
              ],
              "type": "string"
            },
            "submission": {
              "anyOf": [
                {
                  "defaultProperties": [
                  ],
                  "properties": {
                    "kind": {
                      "enum": [
                        "word"
                      ],
                      "type": "string"
                    },
                    "word": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "kind",
                    "word"
                  ],
                  "type": "object"
                },
                {
                  "defaultProperties": [
                  ],
                  "properties": {
                    "drawingId": {
                      "type": "string"
                    },
                    "kind": {
                      "enum": [
                        "drawing"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "drawingId",
                    "kind"
                  ],
                  "type": "object"
                }
              ]
            }
          },
          "required": [
            "kind",
            "submission"
          ],
          "type": "object"
        }
      ]
    }
  ]
};
export type ValidateFunction<T> = ((data: unknown) => data is T) & Pick<Ajv.ValidateFunction, 'errors'>
export const isAction = ajv.compile(ActionSchema) as ValidateFunction<Action>;
export default function validate(value: unknown): Action {
  if (isAction(value)) {
    return value;
  } else {
    throw new Error(
      ajv.errorsText(isAction.errors!.filter((e: any) => e.keyword !== 'if'), {dataVar: 'Action'}) +
      '\n\n' +
      inspect(value),
    );
  }
}

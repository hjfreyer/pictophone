/* tslint:disable */
// generated by typescript-json-validator
import Ajv = require('ajv');
import {ExportState, ExportStateMap, StateEntry} from './types';
export const ajv = new Ajv({"allErrors":true,"coerceTypes":false,"format":"fast","nullable":true,"unicode":true,"uniqueItems":true,"useDefaults":true});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

export {ExportState, ExportStateMap, StateEntry};
export const Schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "ExportState": {
      "enum": [
        "DIRTY",
        "EXPORTED",
        "NOT_EXPORTED"
      ],
      "type": "string"
    },
    "ExportStateMap": {
      "additionalProperties": {
        "enum": [
          "DIRTY",
          "EXPORTED",
          "NOT_EXPORTED"
        ],
        "type": "string"
      },
      "defaultProperties": [
      ],
      "type": "object"
    },
    "Record<string,Submission[]>": {
      "defaultProperties": [
      ],
      "description": "Construct a type with a set of properties K of type T",
      "type": "object"
    },
    "Record<string,Submission[]>_1": {
      "defaultProperties": [
      ],
      "description": "Construct a type with a set of properties K of type T",
      "type": "object"
    },
    "Record<string,string>": {
      "defaultProperties": [
      ],
      "description": "Construct a type with a set of properties K of type T",
      "type": "object"
    },
    "StateEntry": {
      "defaultProperties": [
      ],
      "properties": {
        "exports": {
          "additionalProperties": {
            "enum": [
              "DIRTY",
              "EXPORTED",
              "NOT_EXPORTED"
            ],
            "type": "string"
          },
          "defaultProperties": [
          ],
          "type": "object"
        },
        "generation": {
          "type": "number"
        },
        "iteration": {
          "type": "number"
        },
        "lastModified": {
        },
        "state": {
          "anyOf": [
            {
              "allOf": [
                {
                  "defaultProperties": [
                  ],
                  "properties": {
                    "playerOrder": {
                      "items": {
                        "type": "string"
                      },
                      "type": "array"
                    },
                    "players": {
                      "additionalProperties": {
                        "defaultProperties": [
                        ],
                        "properties": {
                          "id": {
                            "type": "string"
                          }
                        },
                        "required": [
                          "id"
                        ],
                        "type": "object"
                      },
                      "defaultProperties": [
                      ],
                      "type": "object"
                    },
                    "state": {
                      "enum": [
                        "UNSTARTED"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "playerOrder",
                    "players",
                    "state"
                  ],
                  "type": "object"
                },
                {
                  "defaultProperties": [
                  ],
                  "properties": {
                    "kind": {
                      "enum": [
                        "game_state"
                      ],
                      "type": "string"
                    },
                    "version": {
                      "enum": [
                        "0"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "kind",
                    "version"
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
                    "playerOrder": {
                      "items": {
                        "type": "string"
                      },
                      "type": "array"
                    },
                    "players": {
                      "additionalProperties": {
                        "defaultProperties": [
                        ],
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "submissions": {
                            "items": {
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
                            "type": "array"
                          }
                        },
                        "required": [
                          "id",
                          "submissions"
                        ],
                        "type": "object"
                      },
                      "defaultProperties": [
                      ],
                      "type": "object"
                    },
                    "state": {
                      "enum": [
                        "STARTED"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "playerOrder",
                    "players",
                    "state"
                  ],
                  "type": "object"
                },
                {
                  "defaultProperties": [
                  ],
                  "properties": {
                    "kind": {
                      "enum": [
                        "game_state"
                      ],
                      "type": "string"
                    },
                    "version": {
                      "enum": [
                        "0"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "kind",
                    "version"
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
                    "displayNames": {
                      "$ref": "#/definitions/Record<string,string>"
                    },
                    "gameId": {
                      "type": "string"
                    },
                    "kind": {
                      "enum": [
                        "game"
                      ],
                      "type": "string"
                    },
                    "playerOrder": {
                      "items": {
                        "type": "string"
                      },
                      "type": "array"
                    },
                    "version": {
                      "enum": [
                        "v1.1.0"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "displayNames",
                    "gameId",
                    "kind",
                    "playerOrder",
                    "version"
                  ],
                  "type": "object"
                },
                {
                  "defaultProperties": [
                  ],
                  "properties": {
                    "state": {
                      "enum": [
                        "UNSTARTED"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "state"
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
                    "displayNames": {
                      "$ref": "#/definitions/Record<string,string>"
                    },
                    "gameId": {
                      "type": "string"
                    },
                    "kind": {
                      "enum": [
                        "game"
                      ],
                      "type": "string"
                    },
                    "playerOrder": {
                      "items": {
                        "type": "string"
                      },
                      "type": "array"
                    },
                    "version": {
                      "enum": [
                        "v1.1.0"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "displayNames",
                    "gameId",
                    "kind",
                    "playerOrder",
                    "version"
                  ],
                  "type": "object"
                },
                {
                  "defaultProperties": [
                  ],
                  "properties": {
                    "state": {
                      "enum": [
                        "STARTED"
                      ],
                      "type": "string"
                    },
                    "submissions": {
                      "$ref": "#/definitions/Record<string,Submission[]>"
                    }
                  },
                  "required": [
                    "state",
                    "submissions"
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
                    "displayNames": {
                      "$ref": "#/definitions/Record<string,string>"
                    },
                    "gameId": {
                      "type": "string"
                    },
                    "kind": {
                      "enum": [
                        "game"
                      ],
                      "type": "string"
                    },
                    "playerOrder": {
                      "items": {
                        "type": "string"
                      },
                      "type": "array"
                    },
                    "version": {
                      "enum": [
                        "v1.2.0"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "displayNames",
                    "gameId",
                    "kind",
                    "playerOrder",
                    "version"
                  ],
                  "type": "object"
                },
                {
                  "defaultProperties": [
                  ],
                  "properties": {
                    "state": {
                      "enum": [
                        "UNSTARTED"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "state"
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
                    "displayNames": {
                      "$ref": "#/definitions/Record<string,string>"
                    },
                    "gameId": {
                      "type": "string"
                    },
                    "kind": {
                      "enum": [
                        "game"
                      ],
                      "type": "string"
                    },
                    "playerOrder": {
                      "items": {
                        "type": "string"
                      },
                      "type": "array"
                    },
                    "version": {
                      "enum": [
                        "v1.2.0"
                      ],
                      "type": "string"
                    }
                  },
                  "required": [
                    "displayNames",
                    "gameId",
                    "kind",
                    "playerOrder",
                    "version"
                  ],
                  "type": "object"
                },
                {
                  "defaultProperties": [
                  ],
                  "properties": {
                    "state": {
                      "enum": [
                        "STARTED"
                      ],
                      "type": "string"
                    },
                    "submissions": {
                      "$ref": "#/definitions/Record<string,Submission[]>_1"
                    }
                  },
                  "required": [
                    "state",
                    "submissions"
                  ],
                  "type": "object"
                }
              ]
            }
          ]
        }
      },
      "required": [
        "exports",
        "generation",
        "iteration",
        "lastModified",
        "state"
      ],
      "type": "object"
    }
  }
};
ajv.addSchema(Schema, 'Schema')
export function validate(typeName: 'ExportState'): (value: unknown) => ExportState;
export function validate(typeName: 'ExportStateMap'): (value: unknown) => ExportStateMap;
export function validate(typeName: 'StateEntry'): (value: unknown) => StateEntry;
export function validate(typeName: string): (value: unknown) => any {
  const validator: any = ajv.getSchema(`Schema#/definitions/${typeName}`);
  return (value: unknown): any => {
    if (!validator) {
      throw new Error(`No validator defined for Schema#/definitions/${typeName}`)
    }
  
    const valid = validator(value);

    if (!valid) {
      throw new Error(
        'Invalid ' + typeName + ': ' + ajv.errorsText(validator.errors!.filter((e: any) => e.keyword !== 'if'), {dataVar: typeName}),
      );
    }

    return value as any;
  };
}
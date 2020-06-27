/* tslint:disable */
// generated by typescript-json-validator
import Ajv = require('ajv');
import { VersionSpec, DocVersionSpec, VersionSpecRequest, Pointer } from './base';
export const ajv = new Ajv({ "allErrors": true, "coerceTypes": false, "format": "fast", "nullable": true, "unicode": true, "uniqueItems": true, "useDefaults": true });

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

export const Schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "DocVersionSpec": {
            "anyOf": [
                {
                    "defaultProperties": [
                    ],
                    "properties": {
                        "actionId": {
                            "type": "string"
                        },
                        "exists": {
                            "enum": [
                                true
                            ],
                            "type": "boolean"
                        }
                    },
                    "required": [
                        "actionId",
                        "exists"
                    ],
                    "type": "object"
                },
                {
                    "defaultProperties": [
                    ],
                    "properties": {
                        "exists": {
                            "enum": [
                                false
                            ],
                            "type": "boolean"
                        }
                    },
                    "required": [
                        "exists"
                    ],
                    "type": "object"
                }
            ]
        },
        "Pointer": {
            "defaultProperties": [
            ],
            "properties": {
                "actionId": {
                    "type": "string"
                }
            },
            "required": [
                "actionId"
            ],
            "type": "object"
        },
        "Record<string,DocVersionSpec>": {
            "defaultProperties": [
            ],
            "description": "Construct a type with a set of properties K of type T",
            "type": "object"
        },
        "VersionSpec": {
            "defaultProperties": [
            ],
            "properties": {
                "collections": {
                    "items": {
                        "type": "string"
                    },
                    "type": "array"
                },
                "docs": {
                    "$ref": "#/definitions/Record<string,DocVersionSpec>"
                }
            },
            "required": [
                "collections",
                "docs"
            ],
            "type": "object"
        },
        "VersionSpecRequest": {
            "defaultProperties": [
            ],
            "properties": {
                "collections": {
                    "items": {
                        "type": "string"
                    },
                    "type": "array"
                },
                "docs": {
                    "items": {
                        "type": "string"
                    },
                    "type": "array"
                }
            },
            "required": [
                "collections",
                "docs"
            ],
            "type": "object"
        }
    }
};
ajv.addSchema(Schema, 'Schema')
export function validate(typeName: 'VersionSpec'): (value: unknown) => VersionSpec;
export function validate(typeName: 'DocVersionSpec'): (value: unknown) => DocVersionSpec;
export function validate(typeName: 'VersionSpecRequest'): (value: unknown) => VersionSpecRequest;
export function validate(typeName: 'Pointer'): (value: unknown) => Pointer;
export function validate(typeName: string): (value: unknown) => any {
    const validator: any = ajv.getSchema(`Schema#/definitions/${typeName}`);
    return (value: unknown): any => {
        if (!validator) {
            throw new Error(`No validator defined for Schema#/definitions/${typeName}`)
        }

        const valid = validator(value);

        if (!valid) {
            throw new Error(
                'Invalid ' + typeName + ': ' + ajv.errorsText(validator.errors!.filter((e: any) => e.keyword !== 'if'), { dataVar: typeName }),
            );
        }

        return value as any;
    };
}
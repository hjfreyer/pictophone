/* tslint:disable */
// generated by typescript-json-validator
import {inspect} from 'util';
import Ajv = require('ajv');
import UploadResponse from './UploadResponse';
export const ajv = new Ajv({"allErrors":true,"coerceTypes":false,"format":"fast","nullable":true,"unicode":true,"uniqueItems":true,"useDefaults":true});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

export {UploadResponse};
export const UploadResponseSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
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
};
export type ValidateFunction<T> = ((data: unknown) => data is T) & Pick<Ajv.ValidateFunction, 'errors'>
const rawValidateUploadResponse = ajv.compile(UploadResponseSchema) as ValidateFunction<UploadResponse>;
export default function validate(value: unknown): UploadResponse {
  if (rawValidateUploadResponse(value)) {
    return value;
  } else {
    throw new Error(
      ajv.errorsText(rawValidateUploadResponse.errors!.filter((e: any) => e.keyword !== 'if'), {dataVar: 'UploadResponse'}) +
      '\n\n' +
      inspect(value),
    );
  }
}
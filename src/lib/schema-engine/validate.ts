import Ajv, { type ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import type { TemplateSchemaDocument } from "./template";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export type ValidationResult =
  | { ok: true; data: unknown }
  | { ok: false; errors: ErrorObject[] | null | undefined };

export function validateAgainstTemplate(doc: TemplateSchemaDocument, data: unknown): ValidationResult {
  const validate = ajv.compile(doc.jsonSchema);
  const copy = typeof data === "object" && data !== null ? { ...data } : data;
  const valid = validate(copy);
  if (valid) return { ok: true, data: copy };
  return { ok: false, errors: validate.errors };
}

export function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors?.length) return "Validation failed";
  return errors.map((e) => `${e.instancePath || "/"} ${e.message}`).join("; ");
}

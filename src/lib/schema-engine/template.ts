export type FileSlot = {
  key: string;
  label: string;
  extensions: string[];
  maxSizeMB: number;
  required?: boolean;
};

/** Stored in Template.schema */
export type TemplateSchemaDocument = {
  /** JSON Schema for the submission object (draft + final). */
  jsonSchema: Record<string, unknown>;
  /** Optional file upload slots (not part of JSON Schema validation). */
  fileSlots?: FileSlot[];
};

export function parseTemplateSchema(raw: unknown): TemplateSchemaDocument {
  if (!raw || typeof raw !== "object") {
    throw new Error("Template schema must be an object");
  }
  const o = raw as Record<string, unknown>;
  if (!o.jsonSchema || typeof o.jsonSchema !== "object") {
    throw new Error('Template schema must include a "jsonSchema" object');
  }
  const fileSlots = o.fileSlots;
  if (fileSlots !== undefined && !Array.isArray(fileSlots)) {
    throw new Error('"fileSlots" must be an array when present');
  }
  return {
    jsonSchema: o.jsonSchema as Record<string, unknown>,
    fileSlots: fileSlots as FileSlot[] | undefined,
  };
}

export function defaultEmptyPayload(jsonSchema: Record<string, unknown>): unknown {
  if (jsonSchema.type === "object" && jsonSchema.properties && typeof jsonSchema.properties === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(jsonSchema.properties as object)) {
      const prop = (jsonSchema.properties as Record<string, unknown>)[key] as Record<string, unknown>;
      if (prop?.type === "string") out[key] = "";
      else if (prop?.type === "number" || prop?.type === "integer") out[key] = 0;
      else if (prop?.type === "boolean") out[key] = false;
      else if (prop?.type === "array") out[key] = [];
      else if (prop?.type === "object") out[key] = {};
    }
    return out;
  }
  return {};
}

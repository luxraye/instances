"use client";

import { cn } from "@/lib/utils";

type JsonSchema = Record<string, unknown>;

function FieldLabel({ id, title, required }: { id: string; title?: string; required?: boolean }) {
  return (
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {title || id}
      {required ? <span className="text-red-500"> *</span> : null}
    </label>
  );
}

export function JsonSchemaForm({
  schema,
  value,
  onChange,
  disabled,
}: {
  schema: JsonSchema;
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
  disabled?: boolean;
}) {
  const properties = (schema.properties as Record<string, JsonSchema> | undefined) ?? {};
  const requiredList = (schema.required as string[] | undefined) ?? [];

  const setKey = (key: string, v: unknown) => {
    onChange({ ...value, [key]: v });
  };

  return (
    <div className="space-y-4">
      {Object.entries(properties).map(([key, sub]) => {
        const title = (sub.title as string) || key;
        const required = requiredList.includes(key);
        const type = sub.type as string | undefined;
        const id = `field-${key}`;

        if (type === "boolean") {
          return (
            <div key={key} className="flex items-center gap-2">
              <input
                id={id}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={Boolean(value[key])}
                disabled={disabled}
                onChange={(e) => setKey(key, e.target.checked)}
              />
              <FieldLabel id={id} title={title} required={required} />
            </div>
          );
        }

        if (type === "number" || type === "integer") {
          const min = sub.minimum as number | undefined;
          const max = sub.maximum as number | undefined;
          return (
            <div key={key}>
              <FieldLabel id={id} title={title} required={required} />
              <input
                id={id}
                type="number"
                className={cn(
                  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900",
                  disabled && "opacity-60",
                )}
                value={value[key] === undefined || value[key] === null ? "" : Number(value[key])}
                disabled={disabled}
                min={min}
                max={max}
                step={type === "integer" ? 1 : "any"}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") {
                    setKey(key, type === "integer" ? 0 : 0);
                    return;
                  }
                  const n = type === "integer" ? parseInt(raw, 10) : parseFloat(raw);
                  setKey(key, Number.isNaN(n) ? 0 : n);
                }}
              />
            </div>
          );
        }

        if (sub.enum && Array.isArray(sub.enum)) {
          return (
            <div key={key}>
              <FieldLabel id={id} title={title} required={required} />
              <select
                id={id}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                value={String(value[key] ?? "")}
                disabled={disabled}
                onChange={(e) => setKey(key, e.target.value)}
              >
                <option value="">—</option>
                {(sub.enum as string[]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        const format = sub.format as string | undefined;
        const inputType =
          format === "email" ? "email" : format === "date" ? "date" : format === "date-time" ? "datetime-local" : "text";

        const multiline =
          type === "string" &&
          (((sub as { maxLength?: number }).maxLength ?? 0) > 200 ||
            key.toLowerCase().includes("note") ||
            key.toLowerCase().includes("description"));

        if (multiline) {
          return (
            <div key={key}>
              <FieldLabel id={id} title={title} required={required} />
              <textarea
                id={id}
                rows={4}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                value={String(value[key] ?? "")}
                disabled={disabled}
                onChange={(e) => setKey(key, e.target.value)}
              />
            </div>
          );
        }

        return (
          <div key={key}>
            <FieldLabel id={id} title={title} required={required} />
            <input
              id={id}
              type={inputType}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
              value={String(value[key] ?? "")}
              disabled={disabled}
              onChange={(e) => setKey(key, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}

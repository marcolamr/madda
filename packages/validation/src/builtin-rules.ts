const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BuiltinRuleFn = (
  value: unknown,
  data: Record<string, unknown>,
  attribute: string,
  params: string[],
) => string | null;

function msg(attribute: string, text: string): string {
  return text.replace(":attribute", attribute);
}

function isMissingForRequired(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (value === "") {
    return true;
  }
  return Array.isArray(value) && value.length === 0;
}

export const builtinRules: Record<string, BuiltinRuleFn> = {
  required(value, _data, attribute): string | null {
    if (isMissingForRequired(value)) {
      return msg(attribute, "The :attribute field is required.");
    }
    return null;
  },

  string(value, _data, attribute): string | null {
    if (value !== null && value !== undefined && typeof value !== "string") {
      return msg(attribute, "The :attribute must be a string.");
    }
    return null;
  },

  email(value, _data, attribute): string | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    if (typeof value !== "string" || !EMAIL_RE.test(value)) {
      return msg(attribute, "The :attribute must be a valid email address.");
    }
    return null;
  },

  numeric(value, _data, attribute): string | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) {
      return msg(attribute, "The :attribute must be a number.");
    }
    return null;
  },

  integer(value, _data, attribute): string | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      return msg(attribute, "The :attribute must be an integer.");
    }
    return null;
  },

  boolean(value, _data, attribute): string | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const ok =
      typeof value === "boolean" ||
      value === 0 ||
      value === 1 ||
      value === "0" ||
      value === "1" ||
      value === "true" ||
      value === "false";
    if (!ok) {
      return msg(attribute, "The :attribute field must be true or false.");
    }
    return null;
  },

  array(value, _data, attribute): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    if (!Array.isArray(value)) {
      return msg(attribute, "The :attribute must be an array.");
    }
    return null;
  },

  min(value, _data, attribute, params): string | null {
    const n = Number(params[0]);
    if (!Number.isFinite(n)) {
      return null;
    }
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === "string" && value.length < n) {
      return msg(attribute, `The :attribute must be at least ${n} characters.`);
    }
    if (Array.isArray(value) && value.length < n) {
      return msg(attribute, `The :attribute must have at least ${n} items.`);
    }
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num) && num < n) {
      return msg(attribute, `The :attribute must be at least ${n}.`);
    }
    return null;
  },

  max(value, _data, attribute, params): string | null {
    const n = Number(params[0]);
    if (!Number.isFinite(n)) {
      return null;
    }
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === "string" && value.length > n) {
      return msg(attribute, `The :attribute may not be greater than ${n} characters.`);
    }
    if (Array.isArray(value) && value.length > n) {
      return msg(attribute, `The :attribute may not have more than ${n} items.`);
    }
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num) && num > n) {
      return msg(attribute, `The :attribute may not be greater than ${n}.`);
    }
    return null;
  },

  in(value, _data, attribute, params): string | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    if (!params.includes(String(value))) {
      return msg(attribute, "The selected :attribute is invalid.");
    }
    return null;
  },

  regex(value, _data, attribute, params): string | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const pattern = params.join(",");
    try {
      const re = new RegExp(pattern);
      if (typeof value !== "string" || !re.test(value)) {
        return msg(attribute, "The :attribute format is invalid.");
      }
    } catch {
      return msg(attribute, "The :attribute format is invalid.");
    }
    return null;
  },

  confirmed(value, data, attribute): string | null {
    const key = `${attribute}_confirmation`;
    if (value !== data[key]) {
      return msg(attribute, "The :attribute confirmation does not match.");
    }
    return null;
  },
};

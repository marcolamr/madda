export type SerializedJobEnvelope = {
  v: 1;
  type: string;
  payload: unknown;
};

export function isSerializedJobEnvelope(x: unknown): x is SerializedJobEnvelope {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  const o = x as Record<string, unknown>;
  return o.v === 1 && typeof o.type === "string" && "payload" in o;
}

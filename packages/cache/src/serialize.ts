export function encodeValue(value: unknown): string {
  return JSON.stringify(value);
}

export function decodeValue<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

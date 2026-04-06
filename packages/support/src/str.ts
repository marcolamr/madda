import { randomBytes, randomUUID } from "node:crypto";

const ASCII_RE = /^[\x00-\x7F]*$/;

/** Static string helpers — subset of Laravel `Illuminate\Support\Str`. */
export class Str {
  static after(subject: string, search: string): string {
    if (search === "") return subject;
    const i = subject.indexOf(search);
    return i === -1 ? "" : subject.slice(i + search.length);
  }

  static afterLast(subject: string, search: string): string {
    if (search === "") return subject;
    const i = subject.lastIndexOf(search);
    return i === -1 ? "" : subject.slice(i + search.length);
  }

  static before(subject: string, search: string): string {
    if (search === "") return subject;
    const i = subject.indexOf(search);
    return i === -1 ? subject : subject.slice(0, i);
  }

  static beforeLast(subject: string, search: string): string {
    if (search === "") return subject;
    const i = subject.lastIndexOf(search);
    return i === -1 ? subject : subject.slice(0, i);
  }

  static between(subject: string, from: string, to: string): string {
    if (from === "" || to === "") return "";
    const start = subject.indexOf(from);
    if (start === -1) return "";
    const rest = subject.slice(start + from.length);
    const end = rest.indexOf(to);
    return end === -1 ? "" : rest.slice(0, end);
  }

  static camel(value: string): string {
    return Str.lcfirst(Str.studly(value.replace(/[-_\s]+/g, " ")));
  }

  static studly(value: string): string {
    return value
      .replace(/[-_\s]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => Str.ucfirst(w.toLowerCase()))
      .join("");
  }

  static snake(value: string, delimiter = "_"): string {
    const s = value.replace(/([a-z\d])([A-Z])/g, `$1${delimiter}$2`);
    return s.replace(/[-\s]+/g, delimiter).toLowerCase();
  }

  static kebab(value: string): string {
    return Str.snake(value, "-");
  }

  static lcfirst(value: string): string {
    if (value === "") return value;
    return value.charAt(0).toLowerCase() + value.slice(1);
  }

  static ucfirst(value: string): string {
    if (value === "") return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  static upper(value: string): string {
    return value.toUpperCase();
  }

  static lower(value: string): string {
    return value.toLowerCase();
  }

  static title(value: string): string {
    return value.replace(/\w\S*/g, (txt) => Str.ucfirst(txt.toLowerCase()));
  }

  static headline(value: string): string {
    return Str.title(Str.replace(/[-_]+/g, " ", value));
  }

  static squish(value: string): string {
    return value.trim().replace(/\s+/g, " ");
  }

  static length(value: string): number {
    return [...value].length;
  }

  static limit(value: string, limit = 100, end = "..."): string {
    if (value.length <= limit) return value;
    return value.slice(0, limit) + end;
  }

  static startsWith(haystack: string, needles: string | string[]): boolean {
    const list = Array.isArray(needles) ? needles : [needles];
    return list.some((n) => haystack.startsWith(n));
  }

  static endsWith(haystack: string, needles: string | string[]): boolean {
    const list = Array.isArray(needles) ? needles : [needles];
    return list.some((n) => haystack.endsWith(n));
  }

  static contains(haystack: string, needles: string | string[]): boolean {
    const list = Array.isArray(needles) ? needles : [needles];
    return list.some((n) => haystack.includes(n));
  }

  static containsAll(haystack: string, needles: string[]): boolean {
    return needles.every((n) => haystack.includes(n));
  }

  static finish(value: string, cap: string): string {
    return Str.endsWith(value, cap) ? value : value + cap;
  }

  static start(value: string, prefix: string): string {
    return Str.startsWith(value, prefix) ? value : prefix + value;
  }

  static is(value: string, pattern: string | RegExp): boolean {
    if (typeof pattern === "string") {
      return value === pattern;
    }
    pattern.lastIndex = 0;
    return pattern.test(value);
  }

  static isAscii(value: string): boolean {
    return ASCII_RE.test(value);
  }

  static isUuid(value: string): boolean {
    return /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(
      value,
    );
  }

  static uuid(): string {
    return randomUUID();
  }

  static random(length = 16): string {
    const bytes = randomBytes(Math.ceil((length * 3) / 4));
    return bytes
      .toString("base64")
      .replace(/\+/g, "")
      .replace(/\//g, "")
      .replace(/=+$/, "")
      .slice(0, length);
  }

  static slug(title: string, separator = "-"): string {
    let s = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    s = s.toLowerCase().replace(/[^a-z0-9]+/g, separator);
    s = s.replace(new RegExp(`^${escapeRe(separator)}+|${escapeRe(separator)}+$`, "g"), "");
    return s;
  }

  static replace(search: string | RegExp, replace: string, subject: string): string {
    if (typeof search === "string") {
      return subject.split(search).join(replace);
    }
    search.lastIndex = 0;
    return subject.replace(search, replace);
  }

  static replaceArray(search: string, replace: string[], subject: string): string {
    let result = subject;
    let i = 0;
    while (result.includes(search) && i < replace.length) {
      result = result.replace(search, replace[i] ?? "");
      i += 1;
    }
    return result;
  }

  static replaceFirst(search: string, replace: string, subject: string): string {
    const idx = subject.indexOf(search);
    if (idx === -1) return subject;
    return subject.slice(0, idx) + replace + subject.slice(idx + search.length);
  }

  static replaceLast(search: string, replace: string, subject: string): string {
    const idx = subject.lastIndexOf(search);
    if (idx === -1) return subject;
    return subject.slice(0, idx) + replace + subject.slice(idx + search.length);
  }

  static mask(value: string, character = "*", index = 0, length?: number): string {
    const len = value.length;
    const take = length ?? len;
    if (take <= 0) return value;
    const end = Math.min(index + take, len);
    return value.slice(0, index) + character.repeat(end - index) + value.slice(end);
  }

  static padBoth(value: string, length: number, pad = " "): string {
    const short = length - value.length;
    if (short <= 0) return value;
    const left = Math.floor(short / 2);
    const right = short - left;
    return pad.repeat(left) + value + pad.repeat(right);
  }

  static padLeft(value: string, length: number, pad = " "): string {
    const short = length - value.length;
    return short <= 0 ? value : pad.repeat(short) + value;
  }

  static padRight(value: string, length: number, pad = " "): string {
    const short = length - value.length;
    return short <= 0 ? value : value + pad.repeat(short);
  }

  static wordCount(value: string): number {
    const m = value.trim().match(/\S+/g);
    return m ? m.length : 0;
  }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

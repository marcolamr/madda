import type { JobContext } from "./job-context.js";
import { InvalidJobEnvelopeError, UnknownJobTypeError } from "./errors.js";
import { isSerializedJobEnvelope, type SerializedJobEnvelope } from "./job-envelope.js";

export type JobHandlerFn = (payload: unknown, ctx: JobContext) => void | Promise<void>;

/**
 * Registo de tipos de job + serialização JSON (`type` + `payload` JSON-safe).
 */
export class JobSerializer {
  private readonly handlers = new Map<string, JobHandlerFn>();

  register(type: string, handler: JobHandlerFn): this {
    this.handlers.set(type, handler);
    return this;
  }

  has(type: string): boolean {
    return this.handlers.has(type);
  }

  forget(type: string): this {
    this.handlers.delete(type);
    return this;
  }

  clear(): void {
    this.handlers.clear();
  }

  stringify(type: string, payload: unknown): string {
    const env: SerializedJobEnvelope = { v: 1, type, payload };
    return JSON.stringify(env);
  }

  parse(raw: string): SerializedJobEnvelope {
    let data: unknown;
    try {
      data = JSON.parse(raw) as unknown;
    } catch {
      throw new InvalidJobEnvelopeError("Job payload is not valid JSON");
    }
    if (!isSerializedJobEnvelope(data)) {
      throw new InvalidJobEnvelopeError();
    }
    return data;
  }

  async run(raw: string, ctx: JobContext): Promise<void> {
    const env = this.parse(raw);
    const fn = this.handlers.get(env.type);
    if (!fn) {
      throw new UnknownJobTypeError(env.type);
    }
    await Promise.resolve(fn(env.payload, ctx));
  }
}

/** Classe de job com fábrica estática (padrão Laravel-like). */
export type JobCtor = {
  readonly type: string;
  fromPayload(data: unknown): { handle(ctx: JobContext): void | Promise<void> };
};

export function registerJobCtor(serializer: JobSerializer, Ctor: JobCtor): void {
  serializer.register(Ctor.type, (payload, ctx) =>
    Promise.resolve(Ctor.fromPayload(payload).handle(ctx)),
  );
}

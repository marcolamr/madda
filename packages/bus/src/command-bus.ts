import "@madda/reflection";
import type { ContainerResolutionContract } from "@madda/container";
import type { Token } from "@madda/container";
import type { PipeHandler } from "@madda/pipeline";
import { pipeline } from "@madda/pipeline";
import { BUS_HANDLES_COMMAND_METADATA } from "@madda/reflection";
import {
  CommandHandlerInvalidError,
  CommandNotRegisteredError,
  HandlerMissingHandlesMetadataError,
} from "./errors.js";
import { isConstructor } from "./is-constructor.js";

export type CommandCtor = abstract new (...args: unknown[]) => unknown;

export type SyncCommandHandler =
  | ((command: unknown) => unknown)
  | (abstract new (...args: unknown[]) => unknown);

export type DispatchAsyncOptions = {
  /** Middlewares assíncronos em torno do comando antes do handler (via `@madda/pipeline`). */
  through?: PipeHandler<object>[];
};

/**
 * Barramento síncrono de comandos/queries — handlers via função, classe + container ou `@Handles`.
 */
export class CommandBus {
  private readonly handlers = new Map<CommandCtor, SyncCommandHandler>();

  constructor(private readonly container: ContainerResolutionContract) {}

  register(command: CommandCtor, handler: SyncCommandHandler): this {
    this.handlers.set(command, handler);
    return this;
  }

  /**
   * Lê `@Handles(Command)` na classe e regista o par.
   */
  registerHandler(handlerClass: abstract new (...args: unknown[]) => unknown): this {
    const command = Reflect.getMetadata(
      BUS_HANDLES_COMMAND_METADATA,
      handlerClass,
    ) as CommandCtor | undefined;
    if (!command) {
      throw new HandlerMissingHandlesMetadataError(handlerClass.name);
    }
    this.handlers.set(command, handlerClass);
    return this;
  }

  has(command: CommandCtor): boolean {
    return this.handlers.has(command);
  }

  forget(command: CommandCtor): this {
    this.handlers.delete(command);
    return this;
  }

  clear(): void {
    this.handlers.clear();
  }

  dispatch<R = unknown>(command: object): R {
    const ctor = command.constructor as CommandCtor;
    const handler = this.handlers.get(ctor);
    if (!handler) {
      throw new CommandNotRegisteredError(ctor.name);
    }
    const out = this.invoke(handler, command);
    return out as R;
  }

  /**
   * Com `through`, executa o pipeline assíncrono e no fim o handler síncrono.
   * Sem `through`, equivale a `Promise.resolve(dispatch(command))`.
   */
  async dispatchAsync<R = unknown>(
    command: object,
    options?: DispatchAsyncOptions,
  ): Promise<R> {
    const ctor = command.constructor as CommandCtor;
    const handler = this.handlers.get(ctor);
    if (!handler) {
      throw new CommandNotRegisteredError(ctor.name);
    }
    const pipes = options?.through ?? [];
    if (pipes.length === 0) {
      return Promise.resolve(this.dispatch<R>(command));
    }
    return pipeline(command)
      .through(...pipes)
      .then((cmd) => this.invoke(handler, cmd) as R);
  }

  private invoke(handler: SyncCommandHandler, command: unknown): unknown {
    if (!isConstructor(handler)) {
      return (handler as (c: unknown) => unknown)(command);
    }
    const instance = this.container.get(handler as Token);
    const fn = (instance as { handle?: (c: unknown) => unknown }).handle;
    if (typeof fn !== "function") {
      throw new CommandHandlerInvalidError(handler.name);
    }
    return fn.call(instance, command);
  }
}

/** Alias semântico para queries (mesma implementação). */
export type QueryBus = CommandBus;

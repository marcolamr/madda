import "@madda/reflection";
import { BUS_HANDLES_COMMAND_METADATA } from "@madda/reflection";

/** Associa a classe handler ao comando tratado (metadado + `bus.registerHandler()`). */
export function Handles(command: abstract new (...args: unknown[]) => unknown): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(BUS_HANDLES_COMMAND_METADATA, command, target);
  };
}

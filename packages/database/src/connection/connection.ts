import type {
  ConnectionContract,
  RawRow,
  RunResult,
} from "./connection-contract.js";

/**
 * Base class for all concrete connections.
 * Subclasses implement the four driver primitives; shared helpers live here.
 */
export abstract class Connection implements ConnectionContract {
  abstract readonly driverName: string;

  abstract select(sql: string, bindings?: unknown[]): Promise<RawRow[]>;
  abstract statement(sql: string, bindings?: unknown[]): Promise<RunResult>;
  abstract run(sql: string): Promise<void>;
  abstract transaction<T>(
    callback: (connection: ConnectionContract) => Promise<T>,
  ): Promise<T>;
}

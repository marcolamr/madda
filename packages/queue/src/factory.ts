import type { ConfigContract, QueueConfigShape, QueueConnectionConfigShape } from "@madda/config";
import type { ContainerResolutionContract } from "@madda/container";
import type { DatabaseManagerContract } from "@madda/database";
import { redisConnectionFromConfig } from "@madda/redis";
import type { RedisConnectionContract } from "@madda/redis";
import { DatabaseQueueDriver } from "./database-queue-driver.js";
import { QueueMisconfiguredError } from "./errors.js";
import type { JobContext } from "./job-context.js";
import { JobSerializer } from "./job-serializer.js";
import { QueueConnection } from "./queue-connection.js";
import { QueueManager } from "./queue-manager.js";
import type { QueueDriver } from "./queue-driver-contract.js";
import { RedisQueueDriver } from "./redis-queue-driver.js";
import { SyncQueueDriver } from "./sync-queue-driver.js";

const DEFAULT_CONNECTION = "sync";

function defaultConnections(): Record<string, QueueConnectionConfigShape> {
  return {
    sync: { driver: "sync" },
  };
}

function mergeConnections(cfg: Partial<QueueConfigShape>): Record<string, QueueConnectionConfigShape> {
  return {
    ...defaultConnections(),
    ...(cfg.connections ?? {}),
  };
}

function buildDriver(
  connectionLogicalName: string,
  cfg: QueueConnectionConfigShape,
  config: ConfigContract,
  serializer: JobSerializer,
  makeContext: () => JobContext,
  options?: {
    redis?: Record<string, RedisConnectionContract>;
    database?: DatabaseManagerContract;
  },
): QueueDriver {
  switch (cfg.driver) {
    case "sync":
      return new SyncQueueDriver(serializer, makeContext);
    case "redis": {
      const connName = cfg.connection ?? "default";
      const redis =
        options?.redis?.[connName] ??
        redisConnectionFromConfig((k, d) => config.get(k, d), connName);
      const q = cfg.queue ?? "default";
      const listKey = `madda:queue:${connectionLogicalName}:${q}`;
      return new RedisQueueDriver(redis, listKey);
    }
    case "database": {
      const dbm = options?.database;
      if (!dbm) {
        throw new QueueMisconfiguredError(
          connectionLogicalName,
          'driver "database" requires a DatabaseManagerContract (pass options.database).',
        );
      }
      const conn = dbm.connection(cfg.connection);
      const table = cfg.table ?? "jobs";
      const q = cfg.queue ?? "default";
      return new DatabaseQueueDriver(conn, table, q);
    }
    default:
      throw new QueueMisconfiguredError(
        connectionLogicalName,
        `unknown driver "${(cfg as QueueConnectionConfigShape).driver}"`,
      );
  }
}

export type CreateQueueManagerOptions = {
  serializer?: JobSerializer;
  container?: ContainerResolutionContract;
  redis?: Record<string, RedisConnectionContract>;
  database?: DatabaseManagerContract;
};

/**
 * Constrói um `QueueManager` a partir de `queue.default` e `queue.connections`.
 * Sem config, expõe só a ligação `sync`.
 */
export function createQueueManagerFromConfig(
  config: ConfigContract,
  options?: CreateQueueManagerOptions,
): QueueManager {
  const serializer = options?.serializer ?? new JobSerializer();
  const queueCfg = (config.get("queue", {}) as Partial<QueueConfigShape>) ?? {};
  const defaultName = queueCfg.default ?? DEFAULT_CONNECTION;
  const merged = mergeConnections(queueCfg);

  const map = new Map<string, QueueConnection>();
  for (const [name, shape] of Object.entries(merged)) {
    const makeContext = (): JobContext => ({
      connection: name,
      attempt: 1,
      container: options?.container,
    });
    const driver = buildDriver(name, shape, config, serializer, makeContext, options);
    map.set(name, new QueueConnection(name, driver, serializer, makeContext));
  }

  if (!map.has(defaultName)) {
    throw new QueueMisconfiguredError(
      defaultName,
      `queue.default points to missing connection (have: ${[...map.keys()].join(", ")}).`,
    );
  }

  return new QueueManager(serializer, defaultName, map);
}

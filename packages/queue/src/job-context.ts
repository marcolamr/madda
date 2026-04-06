import type { ContainerResolutionContract } from "@madda/container";

export type JobContext = {
  /** Nome da ligação em `queue.connections`. */
  connection: string;
  attempt: number;
  container?: ContainerResolutionContract;
};

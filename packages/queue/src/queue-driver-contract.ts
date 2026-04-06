/**
 * Driver de fila: empurra blobs já serializados pelo {@link JobSerializer}.
 */
export interface QueueDriver {
  push(serializedJob: string): Promise<void>;

  /**
   * Tira um job da fila (bloqueante no Redis; polling na BD).
   * Drivers só síncronos não implementam.
   */
  reserve?(timeoutSeconds: number): Promise<string | null>;
}

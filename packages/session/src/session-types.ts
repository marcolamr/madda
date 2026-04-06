export type SessionData = Record<string, unknown>;

/** Chave reservada na payload persistida para valores `flash()` do pedido anterior. */
export const FLASH_PENDING_KEY = "__flash_pending";

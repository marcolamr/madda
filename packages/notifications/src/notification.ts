import type { OutgoingMail } from "@madda/mail";
import type { Notifiable } from "./notifiable.js";

export type BroadcastPayload = {
  channel: string;
  event: string;
  data: unknown;
};

export type DatabasePayload = {
  /** Geralmente o nome da classe / tipo da notificação. */
  type: string;
  data: Record<string, unknown>;
};

/**
 * Contrato estilo Laravel `Notification`: `via()` escolhe canais; cada canal usa o método correspondente.
 */
export abstract class Notification {
  abstract via(notifiable: Notifiable): readonly string[];

  toDatabase?(notifiable: Notifiable): DatabasePayload;

  toMail?(notifiable: Notifiable): OutgoingMail;

  toBroadcast?(notifiable: Notifiable): BroadcastPayload;
}

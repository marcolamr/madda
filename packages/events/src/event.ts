/**
 * Classe base opcional para eventos de domínio — mesmo papel que `Illuminate\Contracts\Events\ShouldDispatch` / objetos evento.
 * Subclasses podem fixar um nome estável com `static readonly eventType`.
 */
export abstract class Event {
  static readonly eventType?: string;

  get eventName(): string {
    const C = this.constructor as typeof Event;
    return C.eventType ?? C.name;
  }
}

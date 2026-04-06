/** Forma opcional em `config/broadcasting` para rotas por defeito. */
export interface BroadcastingConfigShape {
  /** Caminho GET para subscrição SSE (ex.: `/broadcast/sse`). */
  sse_path?: string;
  /** Caminho GET WebSocket (ex.: `/broadcast/ws`). */
  ws_path?: string;
}

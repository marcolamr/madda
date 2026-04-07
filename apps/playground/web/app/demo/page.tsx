"use client";

import { useState } from "react";

/**
 * Ilha client: marca `"use client"` para documentar o convénio (futuro: bundling só client).
 * Hoje o Vite inclui este módulo no bundle partilhado; o estado é só no browser após hidratação.
 */
export function DemoPage() {
  const [n, setN] = useState(0);

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0 0 0.75rem" }}>
        Demo client
      </h1>
      <p className="muted" style={{ margin: "0 0 1rem" }}>
        Navegação via <code>NavLink</code> não recarrega a página inteira.
      </p>
      <button
        type="button"
        onClick={() => setN((x) => x + 1)}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: 6,
          border: "1px solid var(--border)",
          background: "transparent",
          color: "inherit",
          cursor: "pointer",
        }}
      >
        Contador: {n}
      </button>
    </div>
  );
}

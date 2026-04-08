# Autenticação e sessão

## Sessão

1. Configura `session` na árvore de config (`SessionConfigShape`: cookie, `same_site`, `lifetime`, lojas `file` / `redis`).
2. Regista **`createSessionMiddlewareFromConfig(config)`** como middleware global **antes** do auth baseado em sessão.
3. O cookie do ID de sessão é **assinado** com o segredo derivado de `APP_KEY` (`@madda/cookie` + `@madda/encryption`).

Em produção, usa `secure: true` e `same_site` adequado; com `SameSite=None` o cookie **tem** de ir com `Secure`.

## Auth middleware

`createAuthMiddlewareFromConfig` resolve:

- **Bearer** — se configurares `tokenRepository` (ex.: loja de tokens API).
- **Sessão** — chave configurável (por defeito ID do utilizador na sessão).

`optional: true` preenche `ctx.state` quando há utilizador; `requireAuthMiddleware()` falha com 401 se não houver utilizador.

## Gate (autorização)

O pacote `@madda/auth` expõe **`Gate`** para regras tipo Laravel (`define`, `allows`, `denies`). Combina com o utilizador autenticado no contexto.

## Utilizador na sessão

Após login bem-sucedido, grava o ID (ou payload mínimo) na sessão com a chave configurada e chama `session.regenerate()` quando quiseres prevenir fixação de sessão.

## Referência

Detalhes de tipos: módulos `@madda/session` e `@madda/auth` na [referência TypeDoc](/api/).

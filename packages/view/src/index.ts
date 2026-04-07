/**
 * Escopo (`@madda/view`, Fase 12): a UI principal fica em React (`apps/playground/web`).
 * Aqui ficam helpers de **template em texto** (e-mail, HTML mínimo): reexport de `fillTemplate`
 * (`{{ chave }}`) a partir de `@madda/mail`. Um motor de views no servidor só faria sentido com
 * rotas legadas sem React.
 */
export { fillTemplate } from "@madda/mail";

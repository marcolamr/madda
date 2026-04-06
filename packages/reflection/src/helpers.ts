import { DESIGN_PARAMTYPES } from "./design-keys.js";

/** Tipos de parâmetros do construtor ou método (quando emitidos pelo TS). */
export function getDesignParamTypes(target: object): unknown[] {
  return (Reflect.getMetadata(DESIGN_PARAMTYPES, target) as unknown[] | undefined) ?? [];
}

export function getDesignParamTypesForMethod(
  target: object,
  propertyKey: string | symbol,
): unknown[] {
  return (
    (Reflect.getMetadata(DESIGN_PARAMTYPES, target, propertyKey) as unknown[] | undefined) ?? []
  );
}

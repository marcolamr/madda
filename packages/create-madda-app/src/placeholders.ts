export type TemplateId = "api" | "api-db" | "full";

export type PlaceholderValues = {
  PACKAGE_NAME: string;
  APP_DISPLAY_NAME: string;
  APP_SLUG: string;
};

export function applyPlaceholders(content: string, values: PlaceholderValues): string {
  return content
    .replaceAll("{{PACKAGE_NAME}}", values.PACKAGE_NAME)
    .replaceAll("{{APP_DISPLAY_NAME}}", values.APP_DISPLAY_NAME)
    .replaceAll("{{APP_SLUG}}", values.APP_SLUG);
}

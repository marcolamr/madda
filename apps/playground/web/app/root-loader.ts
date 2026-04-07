export type RootLoaderData = {
  locale: string;
};

export async function rootLoader(): Promise<RootLoaderData> {
  return {
    locale: process.env.APP_LOCALE ?? "en",
  };
}

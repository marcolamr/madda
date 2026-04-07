import { LocalBroadcastHub } from "@madda/broadcasting";

/** Hub partilhado entre `registerBroadcastingRoutes` e rotas demo (processo único). */
export const playgroundBroadcastHub = new LocalBroadcastHub();

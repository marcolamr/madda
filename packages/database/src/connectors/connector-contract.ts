import type { ConnectionConfig } from "../config/database-config.js";
import type { ConnectionContract } from "../connection/connection-contract.js";

/**
 * A Connector is responsible for opening a raw engine connection from config.
 * One connector per driver; the {@link DatabaseManager} selects the right one.
 */
export interface ConnectorContract {
  connect(config: ConnectionConfig): ConnectionContract;
}

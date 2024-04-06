import type { Connection } from "./server";

let c: Connection;

export function registerLogger(connection: Connection) {
  c = connection;
}

export function logMessage(message: string) {
  c.sendNotification("logMessage", message);
}

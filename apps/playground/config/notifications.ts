import type { NotificationConfigShape } from "@madda/config";

const notificationsConfig = {
  table: "notifications",
  default_notifiable_type: "user",
} satisfies NotificationConfigShape;

export default notificationsConfig;

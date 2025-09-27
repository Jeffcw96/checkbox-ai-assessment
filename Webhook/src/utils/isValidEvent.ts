import { EventType } from "../type/event.type";

export const supportedEvent: EventType[] = [
  "contract.comment_added",
  "contract.created",
  "contract.status_updated",
];
export const isValidEvent = (eventType: EventType) =>
  supportedEvent.includes(eventType);

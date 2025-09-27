import { EventType } from "../type/event.type";
import { eventSchemaMapper } from "../utils/eventSchemaMapper";
import { isValidEvent } from "../utils/isValidEvent";

export const validateEvent = (
  event: string
): { isValid: false; error: string } | { isValid: true } => {
  if (typeof event !== "string") {
    return { error: "Missing or invalid 'event' field", isValid: false };
  }

  if (!isValidEvent(event as EventType)) {
    return { error: "Missing or invalid 'event' field", isValid: false };
  }

  return { isValid: true };
};

export const validateSchemaPayload = (
  payload: Record<string, any>
):
  | { isValid: false; error: string }
  | { isValid: true; data: { event: string; [key: string]: any } } => {
  const schema = eventSchemaMapper[payload.event];
  if (!schema) {
    return {
      isValid: false,
      error: `No schema registered for event: ${payload.event}`,
    };
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
      code: i.code,
    }));
    return {
      isValid: false,
      error: JSON.stringify({ event: payload.event, issues }),
    };
  }

  const validatedData = parsed.data as { event: string; [key: string]: any };
  return { isValid: true, data: validatedData };
};

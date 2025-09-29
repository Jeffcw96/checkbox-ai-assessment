import { PublishCommand } from "@aws-sdk/client-sns";
import { EventType } from "../type/event.type";
import { snsClient } from "../utils/aws";
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

export const publishEventToQueue = async (payload: {
  event: string;
  [key: string]: any;
}): Promise<{ isValid: false; error: string } | { isValid: true }> => {
  // New: Publish to SNS
  const topicArn = process.env.EVENT_ADAPTER_SNS_TOPIC_ARN;
  if (!topicArn) {
    return { isValid: false, error: "SNS topic ARN not configured" };
  }

  try {
    await snsClient.send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: JSON.stringify(payload),
      })
    );

    return { isValid: true };
  } catch (e) {
    console.error("Error publishing to SNS:", e);
    return { isValid: false, error: "Failed to publish message to SNS" };
  }
};

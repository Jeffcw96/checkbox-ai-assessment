import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import axios from "axios";

const dynamoDBClient = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;
const METRIC_NAMESPACE = process.env.METRIC_NAMESPACE || "event_adapter_dev";
const CHECKBOX_API_URL =
  process.env.CHECKBOX_API_URL || "https://checkbox-ai-backend.vercel.app";
const MAX_RETRIES = 5;

function datadogMeticStub(name: string, value: number, tags: string[] = []) {
  console.debug("[metric]", { namespace: METRIC_NAMESPACE, name, value, tags });
}

export const handler = async (event: any) => {
  if (!CHECKBOX_API_URL) console.warn("CHECKBOX_API_URL not set");

  const failures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    const messageId = record.messageId;
    const body = safeParse(record.body);
    const payload = body?.Message ? safeParse(body.Message) : body;

    const now = new Date().toISOString();
    const eventID = payload.eventID || messageId;
    const eventType = payload.event || "unknown";
    const source = "WEBHOOK";
    const receiveCount = Number(
      record.attributes?.ApproximateReceiveCount || "1"
    );
    const retryCountValue = String(receiveCount - 1);

    console.log("record", record);

    let apiSucceeded = false;
    try {
      await axios.post(
        `${CHECKBOX_API_URL}/webhook`,
        { payload },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      apiSucceeded = true;
    } catch {
      apiSucceeded = false;
    }

    const status = apiSucceeded ? "PROCESSED" : "PENDING";

    console.log("statussss", status);
    console.log("CHECKBOX_API_URL", CHECKBOX_API_URL);

    const item = {
      eventID: { S: eventID },
      eventType: { S: eventType },
      status: { S: status },
      source: { S: source },
      payload: { S: JSON.stringify(payload) },
      createdAt: { S: now },
      updatedAt: { S: now },
      replayedAt: { NULL: true },
      retryCount: { N: retryCountValue },
    };

    // Build PutItem params; only guard PENDING to avoid downgrade
    const putParams: any = {
      TableName: TABLE_NAME,
      Item: item,
    };
    if (status === "PENDING") {
      putParams.ConditionExpression =
        "attribute_not_exists(eventID) OR #s = :pendingStatus";
      putParams.ExpressionAttributeNames = { "#s": "status" };
      putParams.ExpressionAttributeValues = {
        ":pendingStatus": { S: "PENDING" },
      };
    }

    console.log("putParams", putParams);
    try {
      await dynamoDBClient.send(new PutItemCommand(putParams));
      datadogMeticStub(
        status === "PROCESSED"
          ? "event_adapter.write.processed"
          : "event_adapter.write.pending",
        1,
        [`event_type:${eventType}`]
      );
    } catch (err: any) {
      if (!apiSucceeded && err.name === "ConditionalCheckFailedException") {
        // Existing record already PROCESSED; skip downgrade
        datadogMeticStub("event_adapter.idempotent.skip", 1, [
          `event_type:${eventType}`,
        ]);
      } else {
        datadogMeticStub("event_adapter.write.failure", 1, [
          `event_type:${eventType}`,
          `error:${err.name}`,
        ]);
        failures.push({ itemIdentifier: messageId });
        continue;
      }
    }

    // DLQ reporting for observability
    if (!apiSucceeded && receiveCount >= MAX_RETRIES) {
      datadogMeticStub("event_adapter.dead_letter", 1, [
        `event_type:${eventType}`,
        `retries:${retryCountValue}`,
      ]);
      failures.push({ itemIdentifier: messageId });
    }
  }

  return { batchItemFailures: failures };
};

function safeParse(v: string) {
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

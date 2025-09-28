import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;
const METRIC_NAMESPACE = process.env.METRIC_NAMESPACE || "event_adapter_dev";

function datadogMeticStub(name: string, value: number, tags: string[] = []) {
  console.debug("[metric]", { namespace: METRIC_NAMESPACE, name, value, tags });
}

export const handler = async (event: any) => {
  const failures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    const messageId = record.messageId;
    const body = safeParse(record.body);
    const payload = body?.Message ? safeParse(body.Message) : body;

    const now = new Date().toISOString();
    const eventID = payload?.eventID || messageId;
    const eventType = payload?.eventType || "unknown";
    const source = payload?.source || "webhook";
    const status = payload?.status || "PENDING";
    const receiveCount = Number(
      record.attributes?.ApproximateReceiveCount || "1"
    );

    try {
      // Call Backend API and insert correct status
      // Pending | Processed | Failed
      await dynamoDBClient.send(
        new PutItemCommand({
          TableName: TABLE_NAME,
          Item: {
            eventID: { S: eventID },
            eventType: { S: eventType },
            status: { S: status },
            source: { S: source },
            payload: { S: JSON.stringify(payload) },
            createdAt: { S: now },
            updatedAt: { S: now },
            replayedAt: { NULL: true },
            retryCount: { N: String(receiveCount - 1) },
          },
          ConditionExpression: "attribute_not_exists(eventID)",
        })
      );
      datadogMeticStub("event_adapter.write.success", 1, [
        `event_type:${eventType}`,
      ]);
    } catch (err: any) {
      if (err.name === "ConditionalCheckFailedException") {
        await dynamoDBClient.send(
          new UpdateItemCommand({
            TableName: TABLE_NAME,
            Key: { eventID: { S: eventID } },
            UpdateExpression: "SET retryCount = :r, updatedAt = :u",
            ExpressionAttributeValues: {
              ":r": { N: String(receiveCount - 1) },
              ":u": { S: now },
            },
          })
        );
        datadogMeticStub("event_adapter.update.idempotent", 1, [
          `event_type:${eventType}`,
        ]);
      } else {
        datadogMeticStub("event_adapter.write.failure", 1, [
          `error:${err.name}`,
        ]);
        failures.push({ itemIdentifier: record.messageId });
      }
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

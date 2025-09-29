import * as cdk from "aws-cdk-lib";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export class CheckBoxStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const topic = new sns.Topic(this, "EventAdapterTopic", {
      topicName: "event-adapter-sns",
    });

    const dlq = new sqs.Queue(this, "EventAdapterDLQ", {
      queueName: "event-adapter-dlq",
      retentionPeriod: Duration.days(14),
    });

    const queue = new sqs.Queue(this, "EventAdapterQueue", {
      queueName: "event-adapter-sqs",
      visibilityTimeout: Duration.seconds(180),
      deadLetterQueue: { queue: dlq, maxReceiveCount: 5 },
    });

    topic.addSubscription(new subs.SqsSubscription(queue));

    const table = new dynamodb.Table(this, "EventTable", {
      tableName: "event-table",
      partitionKey: { name: "eventID", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const fn = new NodejsFunction(this, "EventAdapterFn", {
      functionName: "event-adapter",
      entry: "lambda/event-adapter/index.ts",
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 256,
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: table.tableName,
        METRIC_NAMESPACE: "event_adapter_dev",
        MAX_RETRIES: "5", // align with SQS redrive maxReceiveCount
      },
      bundling: {
        externalModules: ["@aws-sdk/*"],
        sourcesContent: false,
      },
    });

    // SQS Event Source
    fn.addEventSource(
      new lambdaEventSources.SqsEventSource(queue, {
        batchSize: 5,
        reportBatchItemFailures: true,
      })
    );

    // Permissions
    table.grantReadWriteData(fn);

    // Outputs
    new cdk.CfnOutput(this, "TopicName", { value: topic.topicName });
    new cdk.CfnOutput(this, "QueueName", { value: queue.queueName });
    new cdk.CfnOutput(this, "DLQName", { value: dlq.queueName });
    new cdk.CfnOutput(this, "TableName", { value: table.tableName });
    new cdk.CfnOutput(this, "LambdaName", { value: fn.functionName });
  }
}

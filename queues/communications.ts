import {
  SQSBatchItemFailure,
  SQSHandler,
} from "aws-lambda";
import { AWSError, SQS } from "aws-sdk";
import { SendMessageResult } from "aws-sdk/clients/sqs";
import { PromiseResult } from "aws-sdk/lib/request";
import { QueueData, QUEUETYPES } from "../types";

const sqs: SQS = new SQS();

export const senderQueueMail: (
  data: QueueData
) => Promise<{ data: PromiseResult<SendMessageResult, AWSError> }> = async (
  data
) => {
  try {
    const sqsSender = await sqs
      .sendMessage({
        QueueUrl: process.env.QUEUE_COMMUNICATIONS_URL,
        MessageBody: JSON.stringify(data),
      })
      .promise();
    return {
      data: sqsSender,
    };
  } catch (error) {
    throw new Error("Unexpected error sending the message to a queue.");
  }
};

export const receiverQueueMail: SQSHandler = (event, _, callback) => {
  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    switch (body.type) {
      case QUEUETYPES.MENTEE_MAIL: {
        try {
          //TODO: send mentee mail
        } catch (error) {
          batchItemFailures.push({ itemIdentifier: record.messageId });
        }
        break;
      }
      case QUEUETYPES.MENTOR_MAIL: {
        try {
          //TODO: send mentor mail
        } catch (error) {
          batchItemFailures.push({ itemIdentifier: record.messageId });
        }
        break;
      }
      case QUEUETYPES.MENTEE_DM: {
        try {
          //TODO: send mentee dm
        } catch (error) {
          batchItemFailures.push({ itemIdentifier: record.messageId });
        }
        break;
      }
      case QUEUETYPES.MENTOR_DM: {
        try {
          //TODO: send mentor dm
        } catch (error) {
          batchItemFailures.push({ itemIdentifier: record.messageId });
        }
        break;
      }
      case QUEUETYPES.NOTIFICATION: {
        try {
          //TODO: send notification
        } catch (error) {
          batchItemFailures.push({ itemIdentifier: record.messageId });
        }
        break;
      }
    }
  }

  return callback(null, { batchItemFailures });
};

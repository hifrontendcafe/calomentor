import { TABLE_NAME_FEEDBACK, TABLE_NAME_FEEDBACK_DEV } from "../constants";
import { Feedback } from "../types";
import { put, scan } from "../utils/dynamoDb";

const TableName =
  process.env.STAGE === "dev" ? TABLE_NAME_FEEDBACK_DEV : TABLE_NAME_FEEDBACK;

export const getFeedbackByMentorId = (mentorId: string) => {
  const query: Parameters<typeof scan>[0] = {
    TableName,
    FilterExpression: "#mentor_id = :mentor_id",
    ExpressionAttributeNames: {
      "#mentor_id": "mentor_id",
    },
    ExpressionAttributeValues: {
      ":mentor_id": mentorId,
    },
  };

  return scan<Feedback>(query);
}

export function addFeedback(feedback: Feedback) {
  return put<Feedback>({
    TableName,
    Item: feedback,
  });
}
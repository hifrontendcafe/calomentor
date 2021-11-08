import { TABLE_NAME_MENTORSHIP, } from "../constants";
import { scan } from "../utils/dynamoDb";

export function getMentorshipsByMentorId(id) {
  return scan({
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression: "mentor_id = :mentor_id",
    ExpressionAttributeValues: { ":mentor_id": id, },
  });
}
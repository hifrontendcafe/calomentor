import { TABLE_NAME_MENTORSHIP } from "../constants";
import { scan } from "../utils/dynamoDb";
import { Mentorship } from "../types";

export function getMentorshipsByMentorId(id) {
  return scan<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression: "mentor_id = :mentor_id",
    ExpressionAttributeValues: { ":mentor_id": id },
  });
}

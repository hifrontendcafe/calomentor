import { TABLE_NAME_MENTORSHIP } from "../constants";
import { generateUpdateQuery, get, scan, update } from "../utils/dynamoDb";
import { Mentorship } from "../types";

export function getAllMentorships() {
  return scan<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP
  });
}

export function getMentorshipById(id: string) {
  return get<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
    Key: { id },
  });
}

export function getMentorshipsByMentorId(id) {
  return scan<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression: "mentor_id = :mentor_id",
    ExpressionAttributeValues: { ":mentor_id": id },
  });
}

export function updateMentorship(id: string, data: Partial<Mentorship>,
  allowedToUpdate: (keyof Mentorship)[] = null) {
  let updateExpression: ReturnType<typeof generateUpdateQuery>;
  try {
    updateExpression = generateUpdateQuery<Partial<Mentorship>>(
      data,
      allowedToUpdate
    );
  } catch (err) {
    throw err;
  }
  
  return update<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
    Key: { id },
    ConditionExpression: "attribute_exists(id)",
    ReturnValues: "ALL_NEW",
    ...updateExpression,
  });
}
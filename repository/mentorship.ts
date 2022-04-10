import { TABLE_NAME_MENTORSHIP } from "../constants";
import { Mentorship } from "../types";
import { generateUpdateQuery, get, put, scan, update } from "../utils/dynamoDb";

export function getAllMentorships() {
  return scan<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
  });
}

export function getMentorshipById(id: string) {
  return get<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
    Key: { id },
  });
}

export function getMentorshipsByUserId(id: string) {
  return scan<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression: "mentor_id = :id OR mentee_id = :id",
    ExpressionAttributeValues: { ":id": id },
  });
}

export function getMentorshipsByName(name: string) {
  return scan<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression:
      "contains(mentee_username_discord, :name) OR contains(mentee_name, :name) OR contains(mentor_username_discord, :name) OR contains(mentor_name, :name)",
    ExpressionAttributeValues: { ":name": name },
  });
}

export function getMentorshipsByTimeSlotId(id: string) {
  return scan<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression: "time_slot_id = :time_slot_id",
    ExpressionAttributeValues: { ":time_slot_id": id },
  });
}

export function createMentorship(mentorship: Mentorship) {
  return put<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
    Item: mentorship,
    ConditionExpression: "attribute_not_exists(id)",
  });
}

export function updateMentorship(
  id: string,
  data: Partial<Mentorship>,
  allowedToUpdate: (keyof Mentorship)[] = null
) {
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

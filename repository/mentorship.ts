import { TABLE_NAME_MENTORSHIP } from "../constants";
import { Mentorship } from "../types";
import { generateUpdateQuery, get, put, scan, update } from "../utils/dynamoDb";

const ITEMS_LIMIT = 20;

export function getAllMentorships(lastKey?: string) {
  const query: Parameters<typeof scan>[0] = {
    TableName: TABLE_NAME_MENTORSHIP,
    Limit: ITEMS_LIMIT,
  };

  if (lastKey) {
    query.ExclusiveStartKey = { id: lastKey };
  }

  return scan<Mentorship>(query);
}

export function getMentorshipById(id: string) {
  return get<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
    Key: { id },
  });
}

export function getMentorshipsByUserId(id: string, lastKey?: string) {
  const query: Parameters<typeof scan>[0] = {
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression: "mentor_id = :id OR mentee_id = :id",
    ExpressionAttributeValues: { ":id": id },
    Limit: ITEMS_LIMIT,
  };

  if (lastKey) {
    query.ExclusiveStartKey = { id: lastKey };
  }

  return scan<Mentorship>(query);
}

export function getMentorshipsByName(name: string, lastKey?: string) {
  const query: Parameters<typeof scan>[0] = {
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression: `contains(searcheable_mentee_username_discord, :name) OR 
      contains(searcheable_mentee_name, :name) OR 
      contains(searcheable_mentor_username_discord, :name) OR 
      contains(searcheable_mentor_name, :name)`,
    ExpressionAttributeValues: { ":name": name.toLowerCase() },
    Limit: ITEMS_LIMIT,
  };

  if (lastKey) {
    query.ExclusiveStartKey = { id: lastKey };
  }

  return scan<Mentorship>(query);
}

export function getMentorshipsByTimeSlotId(id: string, lastKey?: string) {
  const query: Parameters<typeof scan>[0] = {
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression: "time_slot_id = :time_slot_id",
    ExpressionAttributeValues: { ":time_slot_id": id },
    Limit: ITEMS_LIMIT,
  };
  if (lastKey) {
    query.ExclusiveStartKey = { id: lastKey };
  }
  return scan<Mentorship>(query);
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

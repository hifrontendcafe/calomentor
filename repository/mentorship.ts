import { TABLE_NAME_MENTORSHIP, TABLE_NAME_MENTORSHIP_DEV } from "../constants";
import { Mentorship } from "../types";
import {
  deleteItem,
  generateUpdateQuery,
  get,
  put,
  scan,
  update,
} from "../utils/dynamoDb";

const TableName =
  process.env.STAGE === "dev"
    ? TABLE_NAME_MENTORSHIP_DEV
    : TABLE_NAME_MENTORSHIP;

export function getAllMentorships(lastKeyId?: string, limit?: string) {
  const query: Parameters<typeof scan>[0] = {
    TableName,
  };

  if (lastKeyId) {
    query.ExclusiveStartKey = {
      id: lastKeyId,
    };
  }

  if (limit) {
    query.Limit = Number.parseInt(limit);
  }

  return scan<Mentorship>(query);
}

export function getMentorshipById(id: string) {
  return get<Mentorship>({
    TableName,
    Key: { id },
  });
}

export function getMentorshipsByUserId(
  id: string,
  lastKeyId?: string,
  limit?: string
) {
  const query: Parameters<typeof scan>[0] = {
    TableName,
    FilterExpression: "mentor_id = :id OR mentee_id = :id",
    ExpressionAttributeValues: { ":id": id },
  };

  if (lastKeyId) {
    query.ExclusiveStartKey = {
      id: lastKeyId,
    };
  }

  if (limit) {
    query.Limit = Number.parseInt(limit);
  }

  return scan<Mentorship>(query);
}

export function getMentorshipsByName(
  name: string,
  lastKeyId?: string,
  limit?: string
) {
  const query: Parameters<typeof scan>[0] = {
    TableName,
    FilterExpression: `contains(searcheable_mentee_username_discord, :name) OR 
      contains(searcheable_mentee_name, :name) OR 
      contains(searcheable_mentor_username_discord, :name) OR 
      contains(searcheable_mentor_name, :name)`,
    ExpressionAttributeValues: { ":name": name.toLowerCase() },
  };

  if (lastKeyId) {
    query.ExclusiveStartKey = {
      id: lastKeyId,
    };
  }

  if (limit) {
    query.Limit = Number.parseInt(limit);
  }

  return scan<Mentorship>(query);
}

export const getMentorshipByMenteeId = (id: string) => {
  const query: Parameters<typeof scan>[0] = {
    TableName,
    FilterExpression: "mentee_id = :id",
    ExpressionAttributeValues: { ":id": id },
  };

  return scan<Mentorship[]>(query);
};

export function getMentorshipsByTimeSlotId(
  id: string,
  lastKeyId?: string,
  limit?: string
) {
  const query: Parameters<typeof scan>[0] = {
    TableName,
    FilterExpression: "time_slot_id = :time_slot_id",
    ExpressionAttributeValues: { ":time_slot_id": id },
  };
  if (lastKeyId) {
    query.ExclusiveStartKey = {
      id: lastKeyId,
    };
  }
  if (limit) {
    query.Limit = Number.parseInt(limit);
  }
  return scan<Mentorship>(query);
}

export function getMentorshipBetweenTwoDates(
  dateOne: string,
  dateTwo: string,
  id?: string
) {
  let FilterExpression = `mentorship_create_date BETWEEN :dateOne AND :dateTwo`;
  const ExpressionAttributeValues = {
    ":dateOne": dateOne,
    ":dateTwo": dateTwo,
  };

  if (id) {
    FilterExpression = `mentee_id = :id AND ${FilterExpression}`;
    ExpressionAttributeValues[":id"] = id;
  }

  const query: Parameters<typeof scan>[0] = {
    TableName,
    FilterExpression,
    ExpressionAttributeValues,
  };

  return scan<Mentorship>(query);
}

export function createMentorship(mentorship: Mentorship) {
  return put<Mentorship>({
    TableName,
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
    TableName,
    Key: { id },
    ConditionExpression: "attribute_exists(id)",
    ReturnValues: "ALL_NEW",
    ...updateExpression,
  });
}

export function deleteMentorship(id: string) {
  return deleteItem<Mentorship>({
    TableName,
    Key: { id },
    ReturnValues: "ALL_OLD",
  });
}

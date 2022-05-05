import {
  TABLE_NAME_USER,
  TABLE_NAME_USER_DEV,
  USER_STATUS,
} from "../constants";
import type { Mentor, Role, User } from "../types";
import {
  deleteItem,
  generateUpdateQuery,
  get,
  put,
  scan,
  update,
} from "../utils/dynamoDb";

const axios = require("axios");

const TableName =
  process.env.STAGE === "dev" ? TABLE_NAME_USER_DEV : TABLE_NAME_USER;

export function createUser(user: User) {
  return put<User>({
    TableName,
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  });
}

interface UserFilters {
  role?: Role;
  onlyInTheProgram?: boolean;
}

export function getUsers(
  filters: UserFilters = {},
  lastKey?: string,
  limit?: string
) {
  const query: Parameters<typeof scan>[0] = {
    TableName,
    ExpressionAttributeNames: { "#role": "role" },
    Select: "ALL_ATTRIBUTES",
  };

  if (filters.role) {
    query.FilterExpression = "contains(#role, :role)";
    query.ExpressionAttributeValues = { ":role": filters.role };
  }

  if (filters.onlyInTheProgram) {
    query.FilterExpression = `${query.FilterExpression} and #userStatus <> :user_status`;
    query.ExpressionAttributeNames["#userStatus"] = "user_status";
    query.ExpressionAttributeValues[":user_status"] =
      USER_STATUS.OUTSIDE_THE_PROGRAM;
  }

  if (lastKey) {
    query.ExclusiveStartKey = { id: lastKey };
  }

  if (limit) {
    query.Limit = Number.parseInt(limit);
  }

  return scan<User>(query);
}

export function getUserById(id: string) {
  return get<User>({
    TableName,
    Key: { id },
  });
}

export function getUserByToken(token: string) {
  return scan<User>({
    TableName,
    FilterExpression: "#token = :user_token",
    ExpressionAttributeNames: {
      "#token": "user_token",
    },
    ExpressionAttributeValues: {
      ":user_token": token,
    },
  });
}

export function deleteUserById(id: string) {
  return deleteItem<User>({
    TableName,
    Key: { id },
    ReturnValues: "ALL_OLD",
  });
}

export function updateUser(
  id: string,
  data: Partial<User>,
  allowedToUpdate: (keyof User)[] = null
) {
  let updateExpression: ReturnType<typeof generateUpdateQuery>;
  try {
    updateExpression = generateUpdateQuery<Partial<User>>(
      data,
      allowedToUpdate
    );
  } catch (err) {
    throw err;
  }

  return update<User>({
    TableName,
    Key: { id },
    ConditionExpression: "attribute_exists(id)",
    ReturnValues: "ALL_NEW",
    ...updateExpression,
  });
}

export function activateUser(id: string, modified_by: string) {
  return updateUser(id, {
    user_status: USER_STATUS.ACTIVE,
    modified_by,
  });
}

export function deactivateUser(id: string, modified_by: string) {
  return updateUser(id, {
    user_status: USER_STATUS.INACTIVE,
    modified_by,
  });
}

export function deleteUserFromMentorship(id: string, modified_by: string) {
  return updateUser(id, {
    user_status: USER_STATUS.OUTSIDE_THE_PROGRAM,
    modified_by,
  });
}

export function addTokenToUser(id: string, user_token: string) {
  return updateUser(id, {
    user_token,
  });
}

export async function getMentors(): Promise<Mentor[]> {
  const query = `*[_type == "mentor"] | order(date desc) {
    _id,
    persona->,
    name,
    description,
    'photo': {
      'alt': photo.alt,
      'src': photo.asset->url
    },
    isActive,
    web,
    calendly,
    github,
    linkedin,
    topics
  }`;

  const url = `https://${
    process.env.SANITY_PROJECT_ID
  }.api.sanity.io/v2022-04-29/data/query/${
    process.env.STAGE === "dev" ? "develop" : "production"
  }?query=${encodeURIComponent(query)}`;

  try {
    const {
      data: { result },
    }: Awaited<{ data: { result: Mentor[] } }> = await axios.get(url);
    return result;
  } catch (error) {
    return error.stack;
  }
}

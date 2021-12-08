import { TABLE_NAME_USER } from "../constants";

import {
  deleteItem,
  generateUpdateQuery,
  get,
  put,
  scan,
  update,
} from "../utils/dynamoDb";

import type { User, Role } from "../types";

export function createUser(user: User) {
  return put<User>({
    TableName: TABLE_NAME_USER,
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  });
}

interface UserFilters {
  role?: Role;
}

export function getUsers(filters: UserFilters = {}) {
  const query: Parameters<typeof scan>[0] = {
    TableName: TABLE_NAME_USER,
    ExpressionAttributeNames: { "#role": "role" },
    ProjectionExpression:
      "id, discord_username, full_name, about_me, email, url_photo, #role, links, skills, isActive",
  };

  if (filters.role) {
    query.FilterExpression = "contains(#role, :role)";
    query.ExpressionAttributeValues = { ":role": filters.role };
  }

  return scan<User>(query);
}

export function getUserById(id: string) {
  return get<User>({
    TableName: TABLE_NAME_USER,
    Key: { id },
  });
}

export function deleteUserById(id: string) {
  return deleteItem<User>({
    TableName: TABLE_NAME_USER,
    Key: { id },
    ReturnValues: "ALL_OLD",
  });
}

export function updateUser(id: string, data: User) {
  let updateExpression: ReturnType<typeof generateUpdateQuery>;
  try {
    updateExpression = generateUpdateQuery<User>(data, [
      "discord_username",
      "full_name",
      "about_me",
      "email",
      "url_photo",
      "role",
      "links",
      "skills",
      "timezone",
    ]);
  } catch (err) {
    throw err;
  }

  return update<User>({
    TableName: TABLE_NAME_USER,
    Key: { id },
    ConditionExpression: "attribute_exists(id)",
    ReturnValues: "ALL_NEW",
    ...updateExpression,
  });
}

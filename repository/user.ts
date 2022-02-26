import { TABLE_NAME_USER } from "../constants";
import type { Role, User } from "../types";
import {
  deleteItem,
  generateUpdateQuery,
  get,
  put,
  scan,
  update,
} from "../utils/dynamoDb";

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
      "id, discord_username, full_name, about_me, email, url_photo, #role, links, skills, is_active, user_timezone, user_token, last_active_by",
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

export function getUserByToken(token: string) {
  return scan<User>({
    TableName: TABLE_NAME_USER,
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
    TableName: TABLE_NAME_USER,
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
    TableName: TABLE_NAME_USER,
    Key: { id },
    ConditionExpression: "attribute_exists(id)",
    ReturnValues: "ALL_NEW",
    ...updateExpression,
  });
}

export function activateUser(id: string, last_active_by: string) {
  return updateUser(id, {
    is_active: true,
    last_active_by,
  });
}

export function deactivateUser(id: string, last_active_by: string) {
  return updateUser(id, {
    is_active: false,
    last_active_by,
  });
}

export function addTokenToUser(id: string, user_token: string) {
  return updateUser(id, {
    user_token,
  });
}

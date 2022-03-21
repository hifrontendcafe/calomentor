import { TABLE_NAME_USER, USER_STATUS } from "../constants";
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
  onlyInTheProgram?: boolean;
}

export function getUsers(filters: UserFilters = {}) {
  const query: Parameters<typeof scan>[0] = {
    TableName: TABLE_NAME_USER,
    ExpressionAttributeNames: { "#role": "role" },
    ProjectionExpression:
      "id, discord_username, full_name, about_me, email, url_photo, #role, links, skills, user_status, user_timezone, user_token, modified_by, accepted_coc",
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

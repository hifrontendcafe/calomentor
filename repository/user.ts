import { TABLE_NAME_USER } from "../constants";

import { put, scan } from "../utils/dynamoDb";

import type { PutItemResult, ScanResult } from "../utils/dynamoDb";
import type { User, Role } from "../types";

import type { AWSError } from "aws-sdk";
import type { PromiseResult } from "aws-sdk/lib/request";

export function createUser(user: User) {
  return put<User>({
    TableName: TABLE_NAME_USER,
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  }) as Promise<PromiseResult<PutItemResult<User>, AWSError>>;
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

  return scan<User>(query) as Promise<
    PromiseResult<ScanResult<User>, AWSError>
  >;
}

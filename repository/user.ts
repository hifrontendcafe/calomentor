import { TABLE_NAME_USER } from "../constants";

import { put } from "../utils/dynamoDb";

import type { PutItemResult } from "../utils/dynamoDb";

import type { User } from "../types";
import type { AWSError } from "aws-sdk";
import type { PromiseResult } from "aws-sdk/lib/request";

export function createUser(user: User) {
  return put<User>({
    TableName: TABLE_NAME_USER,
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  }) as Promise<PromiseResult<PutItemResult<User>, AWSError>>;
}

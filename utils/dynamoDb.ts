import { DynamoDB } from "aws-sdk";
import type { AWSError } from "aws-sdk";
import type { PromiseResult } from "aws-sdk/lib/request";

type GetItemInput = DynamoDB.DocumentClient.GetItemInput;
type GetItemOutput = DynamoDB.DocumentClient.GetItemOutput;
type PutItemInput = DynamoDB.DocumentClient.PutItemInput;
type PutItemOutput = DynamoDB.DocumentClient.PutItemOutput;
type UpdateItemInput = DynamoDB.DocumentClient.UpdateItemInput;
type UpdateItemOutput = DynamoDB.DocumentClient.UpdateItemOutput;
type DeleteItemInput = DynamoDB.DocumentClient.DeleteItemInput;
type DeleteItemOutput = DynamoDB.DocumentClient.DeleteItemOutput;
type ScanInput = DynamoDB.DocumentClient.ScanInput;
type ScanOutput = DynamoDB.DocumentClient.ScanOutput;
type QueryInput = DynamoDB.DocumentClient.QueryInput;
type QueryOutput = DynamoDB.DocumentClient.QueryOutput;

type Result<T> = Promise<PromiseResult<T, AWSError>>;

interface GetItemResult<T = Record<string, any>> extends GetItemOutput {
  Item?: T;
}

interface ScanResult<T = Record<string, any>> extends ScanOutput {
  Items?: T[];
}

interface QueryResult<T = Record<string, any>> extends QueryOutput {
  Items?: T[];
}

interface UpdateItemResult<T = Record<string, any>> extends UpdateItemOutput {
  Attributes?: T;
}

interface PutItemResult<T = Record<string, any>> extends PutItemOutput {
  Attributes?: T;
}

interface DeleteItemResult<T = Record<string, any>> extends DeleteItemOutput {
  Attributes?: T;
}

const dynamoDb = new DynamoDB.DocumentClient();

export function get(params: GetItemInput): Result<GetItemResult>;
export function get<T extends Record<string, any>>(
  params: GetItemInput
): Result<GetItemResult<T>>;

export function get(params: GetItemInput) {
  return dynamoDb.get(params).promise();
}

export function scan(params: ScanInput): Result<ScanResult>;
export function scan<T extends Record<string, any>>(
  params: ScanInput
): Result<ScanResult<T>>;

export function scan(params: ScanInput) {
  return dynamoDb.scan(params).promise();
}

export function query(params: QueryInput): Result<QueryResult>;
export function query<T extends Record<string, any>>(
  params: QueryInput
): Result<QueryResult<T>>;

export function query(params: QueryInput) {
  return dynamoDb.query(params).promise();
}

export function put(params: PutItemInput): Result<PutItemResult>;
export function put<T extends Record<string, any>>(
  params: PutItemInput
): Result<PutItemResult<T>>;

export function put(params: PutItemInput) {
  return dynamoDb.put(params).promise();
}

export function update(params: UpdateItemInput): Result<UpdateItemResult>;
export function update<T extends Record<string, any>>(
  params: UpdateItemInput
): Result<UpdateItemResult<T>>;

export function update(params: UpdateItemInput) {
  return dynamoDb.update(params).promise();
}

export function deleteItem(params: DeleteItemInput): Result<DeleteItemResult>;
export function deleteItem<T extends Record<string, any>>(
  params: DeleteItemInput
): Result<DeleteItemResult<T>>;

export function deleteItem(params: DeleteItemInput) {
  return dynamoDb.delete(params).promise();
}

type UpdateExpression = Pick<
  UpdateItemInput,
  "UpdateExpression" | "ExpressionAttributeNames" | "ExpressionAttributeValues"
>;

/**
 * From a record with fields and values to update and
 * a optional list of allowed fields to update
 * generates an {@link UpdateExpression} that could
 * be used in a dynamodb update operation
 */
export function generateUpdateQuery<
  T extends Record<string, any> = Record<string, any>
>(data: T, allowedFieldsToUpdate: (keyof T)[] = null): UpdateExpression {
  const expression: UpdateExpression = {
    UpdateExpression: "set",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  };

  Object.entries(data).forEach(([key, item]) => {
    if (allowedFieldsToUpdate === null || allowedFieldsToUpdate.includes(key)) {
      expression.UpdateExpression += ` #${key} = :${key},`;
      expression.ExpressionAttributeNames[`#${key}`] = key;
      expression.ExpressionAttributeValues[`:${key}`] = item;
    }
  });

  // remove last comma
  expression.UpdateExpression = expression.UpdateExpression.slice(0, -1);

  if (Object.keys(expression.ExpressionAttributeNames).length === 0) {
    throw new Error("No valid fields to update");
  }

  return expression;
}

export function isAWSError(error: any): error is AWSError {
  return error?.code;
}

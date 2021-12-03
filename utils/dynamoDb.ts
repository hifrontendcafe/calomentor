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

type Result<T> = Promise<PromiseResult<T, AWSError>>;

interface GetItemResult<T = Record<string, any>> extends GetItemOutput {
  Item?: T;
}

interface ScanResult<T = Record<string, any>> extends ScanOutput {
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

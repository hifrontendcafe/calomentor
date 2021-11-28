import { DynamoDB } from "aws-sdk";
import type { AWSError } from "aws-sdk";
import type { PromiseResult } from "aws-sdk/lib/request";

type AttributeMap = DynamoDB.DocumentClient.AttributeMap;
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

export interface GetItemResult<T extends AttributeMap> extends GetItemOutput {
  Item?: T;
}

type Get = <T>(
  params: GetItemInput
) => Promise<PromiseResult<GetItemResult<T | AttributeMap>, AWSError>>;

export interface ScanResult<T extends AttributeMap> extends ScanOutput {
  Items?: T[];
}

type Scan = <T extends AttributeMap>(
  params: ScanInput
) => Promise<PromiseResult<ScanResult<T | AttributeMap>, AWSError>>;

export interface PutItemResult<T> extends PutItemOutput {
  Attributes?: T;
}

type Put = <T extends AttributeMap>(
  params: PutItemInput
) => Promise<PromiseResult<PutItemResult<T | AttributeMap>, AWSError>>;
export interface UpdateItemResult<T> extends UpdateItemOutput {
  Attributes?: T;
}

type Update = <T extends AttributeMap>(
  params: UpdateItemInput
) => Promise<PromiseResult<UpdateItemResult<T | AttributeMap>, AWSError>>;

export interface DeleteItemResult<T> extends DeleteItemOutput {
  Attributes?: T;
}

type Delete = <T>(
  params: DeleteItemInput
) => Promise<PromiseResult<DeleteItemResult<T | AttributeMap>, AWSError>>;

const dynamoDb = new DynamoDB.DocumentClient();

export const get: Get = (params: GetItemInput) =>
  dynamoDb.get(params).promise();

export const scan: Scan = (params: ScanInput) =>
  dynamoDb.scan(params).promise();

export const put: Put = (params) => dynamoDb.put(params).promise();

export const update: Update = (params: UpdateItemInput) =>
  dynamoDb.update(params).promise();

export const deleteItem: Delete = (params: DeleteItemInput) =>
  dynamoDb.delete(params).promise();

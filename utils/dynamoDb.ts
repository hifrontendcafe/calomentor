import { DynamoDB } from "aws-sdk";

export type AttributeMap = DynamoDB.DocumentClient.AttributeMap;
export type GetItemInput = DynamoDB.DocumentClient.GetItemInput;
export type GetItemOutput = DynamoDB.DocumentClient.GetItemOutput;
export type PutItemInput = DynamoDB.DocumentClient.PutItemInput;
export type PutItemOutput = DynamoDB.DocumentClient.PutItemOutput;
export type UpdateItemInput = DynamoDB.DocumentClient.UpdateItemInput;
export type UpdateItemOutput = DynamoDB.DocumentClient.UpdateItemOutput;
export type ScanInput = DynamoDB.DocumentClient.ScanInput;
export type ScanOutput = DynamoDB.DocumentClient.ScanOutput;

export interface GetItemResult<T extends AttributeMap> extends GetItemOutput {
  Item?: T;
}

type Get = <T>(params: GetItemInput) => Promise<GetItemResult<T | AttributeMap>>;

export interface ScanResult<T extends AttributeMap> extends ScanOutput {
  Items?: T[];
}

type Scan = <T extends AttributeMap>(
  params: ScanInput
) => Promise<ScanResult<T | AttributeMap>>;

export interface PutItemResult<T> extends PutItemOutput {
  Attributes?: T;
}

type Put = <T extends AttributeMap>(
  params: PutItemInput
) => Promise<PutItemResult<T | AttributeMap>>;

interface UpdateItemResult<T> extends UpdateItemOutput {
  Attributes?: T;
}

type Update = <T extends AttributeMap>(
  params: UpdateItemInput
) => Promise<UpdateItemResult<T | AttributeMap>>;

const dynamoDb = new DynamoDB.DocumentClient();

export const get: Get = (params: GetItemInput) =>
  dynamoDb.get(params).promise();

export const scan: Scan = (params: ScanInput) =>
  dynamoDb.scan(params).promise();

export const put: Put = (params) => dynamoDb.put(params).promise();

export const update: Update = (params: UpdateItemInput) =>
  dynamoDb.update(params).promise();

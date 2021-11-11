import { DynamoDB } from "aws-sdk";

type AttributeMap = DynamoDB.DocumentClient.AttributeMap;
type GetItemInput = DynamoDB.DocumentClient.GetItemInput;
type GetItemOutput = DynamoDB.DocumentClient.GetItemOutput;
type PutItemInput = DynamoDB.DocumentClient.PutItemInput;
type PutItemOutput = DynamoDB.DocumentClient.PutItemOutput;
type UpdateItemInput = DynamoDB.DocumentClient.UpdateItemInput;
type UpdateItemOutput = DynamoDB.DocumentClient.UpdateItemOutput;
type ScanInput = DynamoDB.DocumentClient.ScanInput;
type ScanOutput = DynamoDB.DocumentClient.ScanOutput;

interface GetItemResult<T> extends GetItemOutput {
  Attributes?: T;
}

type Get = <T extends AttributeMap>(
  params: GetItemInput
) => Promise<GetItemResult<T | AttributeMap>>;

interface ScanResult<T extends AttributeMap> extends ScanOutput {
  Items?: T[];
}

type Scan = <T extends AttributeMap>(
  params: ScanInput
) => Promise<ScanResult<T | AttributeMap>>;

interface PutItemResult<T> extends PutItemOutput {
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

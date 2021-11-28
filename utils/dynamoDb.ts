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

interface GetItemResult<T extends AttributeMap> extends GetItemOutput {
  Item?: T;
}

type Get = <T>(
  params: GetItemInput
) => Promise<PromiseResult<GetItemResult<T>, AWSError>>;

interface ScanResult<T extends AttributeMap> extends ScanOutput {
  Items?: T[];
}

type Scan = <T>(
  params: ScanInput
) => Promise<PromiseResult<ScanResult<T>, AWSError>>;

interface PutItemResult<T extends AttributeMap> extends PutItemOutput {
  Attributes?: T;
}

type Put = <T extends AttributeMap>(
  params: PutItemInput
) => Promise<PromiseResult<PutItemResult<T>, AWSError>>;
interface UpdateItemResult<T> extends UpdateItemOutput {
  Attributes?: T;
}

type Update = <T extends AttributeMap>(
  params: UpdateItemInput
) => Promise<PromiseResult<UpdateItemResult<T>, AWSError>>;

interface DeleteItemResult<T> extends DeleteItemOutput {
  Attributes?: T;
}

type Delete = <T extends AttributeMap>(
  params: DeleteItemInput
) => Promise<PromiseResult<DeleteItemResult<T>, AWSError>>;

const dynamoDb = new DynamoDB.DocumentClient();

export const get: Get = <T>(params: GetItemInput) =>
  dynamoDb.get(params).promise() as Promise<
    PromiseResult<GetItemResult<T>, AWSError>
  >;

export const scan: Scan = <T>(params: ScanInput) =>
  dynamoDb.scan(params).promise() as Promise<
    PromiseResult<ScanResult<T>, AWSError>
  >;

export const put: Put = <T>(params) =>
  dynamoDb.put(params).promise() as Promise<
    PromiseResult<PutItemResult<T>, AWSError>
  >;

export const update: Update = <T>(params: UpdateItemInput) =>
  dynamoDb.update(params).promise() as Promise<
    PromiseResult<UpdateItemResult<T>, AWSError>
  >;

export const deleteItem: Delete = <T>(params: DeleteItemInput) =>
  dynamoDb.delete(params).promise() as Promise<
    PromiseResult<DeleteItemResult<T>, AWSError>
  >;

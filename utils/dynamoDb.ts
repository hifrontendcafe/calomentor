import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();

export const scan = (params) => dynamoDb.scan(params).promise();
export const get = (params) => dynamoDb.get(params).promise();

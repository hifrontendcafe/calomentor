import { Callback, Context } from "aws-lambda";
import { TABLE_NAME_USER } from "../constants";
import { GlobalResponse } from "../types/globalTypes";
const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const activateMentorService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { data } = JSON.parse(event.body);
  const params = {
    TableName: TABLE_NAME_USER,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeValues: {
      ":active": data.status,
    },
    UpdateExpression: "SET active = :active",
    ReturnValues: "ALL_NEW",
  };
  dynamoDb.update(params, (error, result) => {
    let response: GlobalResponse;
    if (error) {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          code: 400,
          message: "error",
          data: error,
        }),
      };
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          code: 200,
          message: "success",
          result: result.Attributes,
        }),
      };
    }
    callback(null, response);
  });
};

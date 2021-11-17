import { Callback, Context } from "aws-lambda";
import { RESPONSE_CODES, TABLE_NAME_WARNINGS } from "../constants";
import { v4 as uuidv4 } from "uuid";
import { throwResponse } from "../utils/throwResponse";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const addWarning = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  const { mentee_id, mentee_mail } = JSON.parse(event.body);

  if (!mentee_id && !mentee_mail) {
    const responseCode = "-301";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
    });
  }

  const warning = {
    id: uuidv4(),
    mentee_id,
    mentee_mail,
  };

  const warningInfo = {
    TableName: TABLE_NAME_WARNINGS,
    Item: warning,
  };

  try {
    const warning = await dynamoDb.put(warningInfo).promise();
    const responseCode = "300";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 200, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      warning,
    });
  } catch (error) {
    const responseCode = "-300";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      error,
    });
  }
};

export const getWarnings = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  const params = {
    TableName: TABLE_NAME_WARNINGS,
    FilterExpression: "mentee_id = :mentee_id",
    ExpressionAttributeValues: {
      ":mentee_id": event.pathParameters?.id,
    },
  };

  try {
    const warnings = await dynamoDb.scan(params).promise();
    console.log(warnings);
    if (warnings.Items?.length === 0) {
      const responseCode = "301";
      return throwResponse(callback, RESPONSE_CODES[responseCode], 200, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
      });
    }
    const responseCode = "-302";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      warnings: warnings.Items,
    });
  } catch (error) {
    const responseCode = "-303";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      error,
    });
  }
};

export const getAllWarnings = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  const params = {
    TableName: TABLE_NAME_WARNINGS,
    ProjectionExpression: "id, mentee_id, mentee_mail",
  };

  try {
    const warnings = await dynamoDb.scan(params).promise();

    const responseCode = "302";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 200, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      warnings: warnings.Items,
    });
  } catch (error) {
    const responseCode = "-303";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      error,
    });
  }
};

export const deleteWarning = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  if (!event.pathParameters.id) {
    const responseCode = "-304";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
    });
  }

  const params = {
    TableName: TABLE_NAME_WARNINGS,
    Key: {
      id: event.pathParameters.id,
    },
    ReturnValues: "ALL_OLD",
  };

  try {
    await dynamoDb.delete(params).promise();
    const responseCode = "303";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 200, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
    });
  } catch (error) {
    const responseCode = "-305";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      error,
    });
  }
};

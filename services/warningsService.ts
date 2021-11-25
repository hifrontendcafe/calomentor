import { Callback, Context } from "aws-lambda";
import {
  RESPONSE_CODES,
  TABLE_NAME_WARNINGS,
  WARNSTATE,
  WARNTYPE,
} from "../constants";
import { v4 as uuidv4 } from "uuid";
import { throwResponse } from "../utils/throwResponse";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const addWarning = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  const { mentee_id, warn_type, warn_cause, mentorship_id } = JSON.parse(
    event.body
  );

  if (
    !mentee_id &&
    !WARNTYPE.includes(warn_type) &&
    !warn_cause &&
    !mentorship_id
  ) {
    const responseCode = "-301";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
    });
  }

  const warning = {
    id: uuidv4(),
    date: Date.now(),
    mentee_id,
    warn_type,
    warn_cause,
    mentorship_id,
    status: WARNSTATE.ACTIVE,
    forgive_cause: "",
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
    ProjectionExpression:
      "id, mentee_id, warn_type, warn_cause, mentorship_id, date, forgive_cause",
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

export const forgiveWarning = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  const { forgive_cause } = JSON.parse(event.body);
  if (!event.pathParameters.id) {
    const responseCode = "-304";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
    });
  }

  const params = {
    TableName: TABLE_NAME_WARNINGS,
    Key: { id: event.pathParameters.id },
    ExpressionAttributeValues: {
      ":status": WARNSTATE.FORGIVE,
      ":forgive_cause": forgive_cause,
    },
    UpdateExpression: "SET forgive_cause = :forgive_cause, status = :status",
    ReturnValues: "ALL_NEW",
  };

  try {
    await dynamoDb.update(params).promise();
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

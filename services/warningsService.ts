import { APIGatewayProxyHandler } from "aws-lambda";
import { STATUS, WARNSTATE, WARN } from "../constants";
import { v4 as uuidv4 } from "uuid";
import { Warning } from "../types";
import {
  addWarning,
  getWarningsData,
  updateWarning,
} from "../repository/warning";
import { updateMentorship } from "../repository/mentorship";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

export const addWarningService: APIGatewayProxyHandler = async (event) => {
  const { mentee_id, warn_type, warn_cause, mentorship_id, warning_author_id } =
    JSON.parse(event.body);

  if (
    !mentee_id &&
    !Object.values(WARN).includes(warn_type) &&
    !warn_cause &&
    !mentorship_id
  ) {
    return makeErrorResponse(400, "-301");
  }

  const warningData: Warning = {
    id: uuidv4(),
    date: Date.now(),
    mentee_id,
    warn_type,
    warn_cause,
    mentorship_id,
    status: WARNSTATE.ACTIVE,
    forgive_cause: null,
    warning_author_id,
  };

  try {
    await addWarning(warningData);
    await updateMentorship(
      mentorship_id,
      {
        mentorship_status: STATUS.WITHWARNING,
        warning_info: warningData,
      },
      ["mentorship_status", "warning_info"]
    );

    return makeSuccessResponse(warningData, "300");
  } catch (error) {
    return makeErrorResponse(400, "-300", error);
  }
};

export const getWarnings: APIGatewayProxyHandler = async (event) => {
  try {
    const warnings = await getWarningsData(event.pathParameters?.id);
    if (warnings.Items?.length === 0) {
      return makeSuccessResponse(null, "301");
    }
    return makeErrorResponse(400, "-302", { warnings: warnings.Items });
  } catch (error) {
    return makeErrorResponse(400, "-303", error);
  }
};

export const getAllWarnings: APIGatewayProxyHandler = async () => {
  try {
    const warnings = await getWarningsData();
    return makeSuccessResponse({ warnings: warnings.Items }, "302");
  } catch (error) {
    return makeErrorResponse(400, "-303", error);
  }
};

export const forgiveWarning: APIGatewayProxyHandler = async (event) => {
  const { forgive_cause } = JSON.parse(event.body);
  const { id } = event.pathParameters;
  if (!id) {
    return makeErrorResponse(400, "-304");
  }

  try {
    const warningUpdate = await updateWarning(
      id,
      { status: WARNSTATE.FORGIVE, forgive_cause },
      ["forgive_cause", "status"]
    );

    await updateMentorship(
      warningUpdate.Attributes.mentorship_id,
      {
        mentorship_status: STATUS.CONFIRMED,
        warning_info: warningUpdate.Attributes,
      },
      ["mentorship_status", "warning_info"]
    );

    return makeSuccessResponse(warningUpdate, "303");
  } catch (error) {
    return makeErrorResponse(400, "-305", error);
  }
};

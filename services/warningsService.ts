import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { STATUS, WARN, WARNSTATE } from "../constants";
import { getMentorshipById, updateMentorship } from "../repository/mentorship";
import { getUserById, getUserByToken } from "../repository/user";
import {
  addWarning,
  getWarningsData,
  updateWarning,
} from "../repository/warning";
import { Warning } from "../types";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";
import { isAdmin } from "../utils/validations";

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
    warning_date: Date.now(),
    mentee_id,
    warn_type,
    warn_cause,
    mentorship_id,
    warning_status: WARNSTATE.ACTIVE,
    forgive_cause: null,
    warning_author_id,
    mentee_name: null,
    mentor_name: null,
    warning_author_name: null,
  };

  try {
    const {
      Item: { mentee_name, mentor_name },
    } = await getMentorshipById(mentorship_id);
    const {
      Item: { full_name },
    } = await getUserById(warning_author_id);
    warningData.mentee_name = mentee_name;
    warningData.mentor_name = mentor_name;
    warningData.warning_author_name = full_name;
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
    return makeErrorResponse(400, "-302", warnings.Items);
  } catch (error) {
    return makeErrorResponse(400, "-303", error);
  }
};

export const getAllWarnings: APIGatewayProxyHandler = async () => {
  try {
    const warnings = await getWarningsData();
    return makeSuccessResponse(warnings.Items, "302");
  } catch (error) {
    return makeErrorResponse(400, "-303", error);
  }
};

export const forgiveWarning: APIGatewayProxyHandler = async (event) => {
  const userToken = event.headers["user-token"];
  if (!userToken || (await getUserByToken(userToken)).Count === 0) {
    return makeErrorResponse(401, "-117");
  }
  if (!(await isAdmin(userToken))) {
    return makeErrorResponse(403, "-116");
  }
  const { forgive_cause } = JSON.parse(event.body);
  const { id } = event.pathParameters;
  if (!id) {
    return makeErrorResponse(400, "-304");
  }

  try {
    const warningUpdate = await updateWarning(
      id,
      { warning_status: WARNSTATE.FORGIVE, forgive_cause },
      ["forgive_cause", "warning_status"]
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

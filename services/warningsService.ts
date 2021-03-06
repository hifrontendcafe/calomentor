import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { STATUS, WARN, WARNSTATE } from "../constants";
import { warningMail } from "../mails/warning";
import {
  getMentorshipBetweenTwoDates,
  getMentorshipById,
  updateMentorship,
} from "../repository/mentorship";
import { getUserById, getUserByToken } from "../repository/user";
import {
  addWarning,
  deleteWarning,
  getWarningsData,
  updateWarning,
} from "../repository/warning";
import { Warning } from "../types";
import { getFirstDayOfMonth } from "../utils/dates";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";
import { orderWarningsByDate } from "../utils/orderBy";
import { sendEmail } from "../utils/sendEmail";
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
    warning_author_username_discord: null,
    mentee_username_discord: null,
    forgive_author_id: null,
    forgive_author_name: null,
    forgive_author_username_discord: null,
    searcheable_warning_author_name: null,
    searcheable_warning_author_username_discord: null,
    searcheable_mentee_name: null,
    searcheable_mentee_username_discord: null,
  };

  try {
    const {
      Item: { mentee_name, mentor_name, mentee_email },
    } = await getMentorshipById(mentorship_id);
    const {
      Item: { full_name },
    } = await getUserById(warning_author_id);

    warningData.mentee_name = mentee_name;
    warningData.mentor_name = mentor_name;
    warningData.warning_author_name = full_name;
    warningData.searcheable_mentee_name = mentee_name.toLowerCase();
    warningData.searcheable_mentor_name = mentor_name.toLowerCase();
    warningData.searcheable_warning_author_name = full_name.toLowerCase();

    await addWarning(warningData);
    await updateMentorship(
      mentorship_id,
      {
        mentorship_status: STATUS.WITHWARNING,
        warning_info: warningData,
      },
      ["mentorship_status", "warning_info"]
    );

    const htmlMentee = warningMail({
      menteeName: mentee_name,
      isNotAssist: warn_type === WARN.NO_ASSIST,
    });
    sendEmail(mentee_email, `Hola ${mentee_name}!`, htmlMentee);

    return makeSuccessResponse(warningData, "300");
  } catch (error) {
    return makeErrorResponse(400, "-300", error);
  }
};

export const addWarningMatebotService: APIGatewayProxyHandler = async (
  event
) => {
  const {
    mentee_id,
    mentee_username_discord,
    warn_type,
    warn_cause,
    warning_author_id,
    warning_author_username_discord,
    warning_date,
  } = JSON.parse(event.body);

  if (
    !mentee_id &&
    !Object.values(WARN).includes(warn_type) &&
    !warn_cause &&
    !warning_author_id
  ) {
    return makeErrorResponse(400, "-301");
  }

  const warningData: Warning = {
    id: uuidv4(),
    warning_date: warning_date || String(Date.now()),
    from_bot: true,
    mentee_id,
    mentee_name: null,
    mentee_username_discord,
    warn_type,
    warn_cause,
    mentorship_id: null,
    warning_status: WARNSTATE.ACTIVE,
    forgive_cause: null,
    mentor_name: null,
    warning_author_id,
    warning_author_name: warning_author_username_discord,
    warning_author_username_discord,
    forgive_author_id: null,
    forgive_author_name: null,
    forgive_author_username_discord: null,
    searcheable_warning_author_name:
      warning_author_username_discord.toLowerCase(),
    searcheable_warning_author_username_discord:
      warning_author_username_discord.toLowerCase(),
    searcheable_mentee_name: mentee_username_discord.toLowerCase(),
    searcheable_mentee_username_discord: mentee_username_discord.toLowerCase(),
  };

  try {
    await addWarning(warningData);
    return makeSuccessResponse(warningData, "300");
  } catch (error) {
    return makeErrorResponse(400, "-300", error);
  }
};

export const getWarnings: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id;
  const allWarnings = Boolean(event.queryStringParameters?.all_warnings);
  const lastKeyId = event.queryStringParameters?.last_key_id;
  const limit = event.queryStringParameters?.limit;
  try {
    const warnings = await getWarningsData(
      { id, allWarnings },
      lastKeyId,
      limit
    );
    if (allWarnings) {
      const today = new Date();
      const firstDayOfTheMonth = getFirstDayOfMonth(today.getTime());
      const mentorships = (
        await getMentorshipBetweenTwoDates(
          firstDayOfTheMonth,
          String(today.getTime()),
          id
        )
      )?.Count;
      return makeSuccessResponse(
        {
          warnings_data: warnings.Items,
          warning_quantity: warnings.Count,
          active_warnings: warnings.Items?.filter(
            (warn) => warn.warning_status === WARNSTATE.ACTIVE
          )?.length,
          mentorships,
        },
        "302",
        warnings.Count,
        warnings.LastEvaluatedKey
      );
    }
    if (warnings?.Items?.length === 0) {
      return makeSuccessResponse(null, "301");
    }
    return makeErrorResponse(400, "-302", warnings.Items);
  } catch (error) {
    return makeErrorResponse(400, "-303", error);
  }
};

export const getAllWarnings: APIGatewayProxyHandler = async (event) => {
  const name = event.queryStringParameters?.name;
  const lastKeyId = event.queryStringParameters?.last_key_id;
  const limit = event.queryStringParameters?.limit;

  try {
    let warnings: Awaited<ReturnType<typeof getWarningsData>>;
    if (name) {
      warnings = await getWarningsData({ name }, lastKeyId, limit);
    } else {
      warnings = await getWarningsData({});
      // Order the mentorships by date and replace the data.Itemes for this
      // ordered array with the last 20 elements
      warnings = {
        ...warnings,
        Items: orderWarningsByDate(
          warnings.Items,
          Number.parseInt(limit || "20")
        ),
      };
    }
    return makeSuccessResponse(
      warnings.Items,
      "302",
      warnings.Count,
      warnings.LastEvaluatedKey
    );
  } catch (error) {
    return makeErrorResponse(400, "-303", error);
  }
};

export const forgiveWarning: APIGatewayProxyHandler = async (event) => {
  // const user_token = event.headers["user-token"];
  // if (!user_token || (await getUserByToken(user_token)).Count === 0) {
  //   return makeErrorResponse(401, "-117");
  // }
  // if (!(await isAdmin(user_token))) {
  //   return makeErrorResponse(403, "-116");
  // }
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

export const forgiveWarningByMentee: APIGatewayProxyHandler = async (event) => {
  const { forgive_cause, forgive_author_id, forgive_author_username_discord } =
    JSON.parse(event.body);
  const { id } = event.pathParameters;
  if (!id) {
    return makeErrorResponse(400, "-304");
  }

  let warningData: Awaited<ReturnType<typeof getWarningsData>>;

  try {
    warningData = await getWarningsData({ id });
  } catch (error) {
    return makeErrorResponse(400, "-303");
  }

  if (warningData?.Count === 0) {
    return makeErrorResponse(400, "301");
  }

  for (const warning of warningData?.Items) {
    try {
      const warningUpdate = await updateWarning(
        warning.id,
        {
          warning_status: WARNSTATE.FORGIVE,
          forgive_cause,
          forgive_author_id,
          forgive_author_name: forgive_author_username_discord,
          forgive_author_username_discord,
          from_bot: true,
          searcheable_forgive_author_name:
            forgive_author_username_discord.toLowerCase(),
          searcheable_forgive_author_username_discord:
            forgive_author_username_discord.toLowerCase(),
        },
        [
          "forgive_cause",
          "warning_status",
          "forgive_author_id",
          "forgive_author_username_discord",
          "forgive_author_name",
          "searcheable_forgive_author_name",
          "searcheable_forgive_author_username_discord",
        ]
      );

      return makeSuccessResponse(warningUpdate, "303");
    } catch (error) {
      return makeErrorResponse(400, "-305", error);
    }
  }
};

export const deleteWarningById: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id;

  try {
    if (!id) {
      return makeErrorResponse(400, "-311");
    }

    await deleteWarning(id);

    return makeSuccessResponse({}, "304");
  } catch (error) {
    return makeErrorResponse(400, "-303", error);
  }
};

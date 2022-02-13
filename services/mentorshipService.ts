import { APIGatewayProxyHandler, Callback, Context, Handler } from "aws-lambda";
import { throwLambdaResponse } from "../utils/throwResponse";
import {
  RESPONSE_CODES,
  STATUS,
  TABLE_NAME_MENTORSHIP,
  TABLE_NAME_USER,
  TABLE_NAME_TIME_SLOT,
} from "../constants";

import {
  fillTimeSlot,
  freeTimeSlot,
  removeMenteeFromTimeSlot,
} from "../repository/timeSlot";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../utils/sendEmail";
const jwt = require("jsonwebtoken");
import { confirmationMail } from "../mails/confirmation";
import { cancelMail } from "../mails/cancel";
import { reminderMail } from "../mails/reminder";
import { feedbackMail } from "../mails/feedback";
import { substractTime, toDateString, toTimeString } from "../utils/dates";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";
import { getMentorshipById, updateMentorship } from "../repository/mentorship";
import { Mentorship } from "../types";

const axios = require("axios");

const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

interface MentorshipRequestBody {
  mentor_id?: string;
  mentee_id?: string;
  mentee_email?: string;
  time_slot_id?: string;
  mentee_name: string;
  mentee_username_discord: string;
  info: string;
}

interface MentorshipStateMachine {
  mentorId: string;
  mentorEmail: string;
  mentorName: string;
  menteeId: string;
  menteeEmail: string;
  menteeName: string;
}

interface BaseMentorshipResponse {
  responseMessage: string;
  responseCode: string;
}

interface MentorshipSuccessResponse extends BaseMentorshipResponse {
  responseData: {
    mentorship: MentorshipStateMachine;
    dateToRemind: Date;
    mentorshipDate: Date;
    token: string;
  };
}

interface MentorshipErrorResponse extends BaseMentorshipResponse {
  responseError: unknown;
}

type MentorshipResponse = MentorshipSuccessResponse | MentorshipErrorResponse;

export const createMentorship: Handler<
  MentorshipRequestBody,
  MentorshipResponse
> = (event, context, callback) => {
  const {
    mentor_id,
    mentee_id,
    mentee_name,
    mentee_username_discord,
    mentee_email,
    mentee_timezone,
    info,
    time_slot_id,
  } = event;

  if (!mentor_id || !mentee_id || !mentee_email || !time_slot_id) {
    return throwLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["-100"],
      responseCode: "-100",
      responseError: RESPONSE_CODES["-100"],
    });
  }

  const mentorship: Mentorship = {
    id: uuidv4(),
    mentor_id,
    mentor_email: null,
    mentor_name: null,
    tokenForCancel: null,
    mentee_id,
    mentee_name,
    mentee_username_discord,
    mentee_email,
    mentee_timezone,
    info,
    mentorship_status: STATUS.ACTIVE,
    time_slot_id,
    cancel_cause: null,
    who_cancel: null,
    feedback_mentee: null,
    feedback_stars: null,
    feedback_mentee_private: null,
    warning_info: null,
  };

  let dateToRemind: Date = new Date();

  const paramsUserId = {
    TableName: TABLE_NAME_USER,
    Key: { id: mentorship.mentor_id },
  };

  const paramsTimeSlot = {
    TableName: TABLE_NAME_TIME_SLOT,
    Key: { id: mentorship.time_slot_id },
  };

  dynamoDb.get(paramsTimeSlot, async (err, timeSlotData) => {
    try {
      if (err) {
        const responseCode: keyof typeof RESPONSE_CODES = "-103";
        return throwLambdaResponse(callback, {
          responseMessage: RESPONSE_CODES[responseCode],
          responseCode,
        });
      }
      const slot = timeSlotData.Item;

      const mentorshipDate = new Date(slot.date);
      dateToRemind = substractTime(mentorshipDate, 1, "days");

      dynamoDb.get(paramsUserId, (err, data) => {
        if (err) {
          const responseCode: keyof typeof RESPONSE_CODES = "-101";
          return throwLambdaResponse(callback, {
            responseMessage: RESPONSE_CODES[responseCode],
            responseCode,
          });
        } else {
          if (Object.keys(data).length === 0) {
            const responseCode: keyof typeof RESPONSE_CODES = "-101";
            return throwLambdaResponse(callback, {
              responseMessage: RESPONSE_CODES[responseCode],
              responseCode,
            });
          } else {
            mentorship.mentor_email = data.Item?.email;
            mentorship.mentor_name = data.Item?.full_name;
            const token = jwt.sign(
              {
                menteeEmail: mentorship.mentee_email,
                mentorshipId: mentorship.id,
                date: mentorshipDate.getTime(),
              },
              process.env.JWT_KEY,
              {
                expiresIn: "90d",
              }
            );
            mentorship.tokenForCancel = token;
            const params = {
              TableName: TABLE_NAME_MENTORSHIP,
              Item: mentorship,
            };

            dynamoDb.put(params, async (error, resMentorship) => {
              if (error) {
                const responseCode: keyof typeof RESPONSE_CODES = "-102";
                return throwLambdaResponse(callback, {
                  responseMessage: RESPONSE_CODES[responseCode],
                  responseCode,
                });
              } else {
                try {
                  await fillTimeSlot(mentorship.time_slot_id);

                  await addMenteeToTimeSlot(mentorship.time_slot_id, {
                    id: mentee_id,
                    username: mentee_username_discord,
                    tokenForCancel: token,
                  });

                  const htmlMentee = confirmationMail({
                    mentorName: data.Item?.full_name,
                    menteeName: mentee_name,
                    date: toDateString(mentorshipDate),
                    time: toTimeString(mentorshipDate),
                    cancelLink: `${process.env.BASE_FRONT_URL}/cancel?token=${token}`,
                    forMentor: false,
                  });

                  sendEmail(
                    mentorship.mentee_email,
                    `Hola ${mentee_name}!`,
                    htmlMentee
                  );
                  const htmlMentor = confirmationMail({
                    mentorName: data.Item?.full_name,
                    menteeName: mentee_name,
                    date: toDateString(mentorshipDate),
                    time: toTimeString(mentorshipDate),
                    cancelLink: `${process.env.BASE_FRONT_URL}/cancel?token=${token}`,
                    forMentor: true,
                  });
                  sendEmail(
                    data.Item?.email,
                    `Hola ${data.Item?.full_name}!`,
                    htmlMentor
                  );
                } catch (error) {
                  return throwLambdaResponse(callback, {
                    responseMessage: RESPONSE_CODES["-1"],
                    responseCode: "-1",
                    responseError: error,
                  });
                }
                const responseCode: keyof typeof RESPONSE_CODES = "100";
                return throwLambdaResponse<MentorshipResponse>(callback, {
                  responseMessage: RESPONSE_CODES[responseCode],
                  responseCode,
                  responseData: {
                    mentorship: {
                      mentorId: data.Item?.id,
                      mentorEmail: data.Item?.email,
                      mentorName: data.Item?.full_name,
                      menteeId: mentorship.mentee_id,
                      menteeEmail: mentorship.mentee_email,
                      menteeName: mentorship.mentee_name,
                      mentee_timezone: mentorship.mentee_timezone,
                    },
                    dateToRemind,
                    mentorshipDate,
                    token,
                  },
                });
              }
            });
          }
        }
      });
    } catch (error) {
      const responseCode: keyof typeof RESPONSE_CODES = "-1";
      return throwLambdaResponse(callback, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
      });
    }
  });
  //TODO: Send confirmation discord dm to the mentor and mentee
};

export const cancelMentorship: APIGatewayProxyHandler = async (event) => {
  const { cancelCause, whoCancel } = JSON.parse(event.body);
  const { token } = event.queryStringParameters;
  const jwtData: any = jwt.verify(token, process.env.JWT_KEY);

  try {
    const mentorship = await getMentorshipById(jwtData.mentorshipId);

    if (mentorship.Item?.mentorship_status === STATUS.CANCEL) {
      return makeErrorResponse(400, "-109");
    }

    await freeTimeSlot(mentorship.Item?.time_slot_id);
    await removeMenteeFromTimeSlot(mentorship.Item?.time_slot_id);

    const mentorshipUpdated = await updateMentorship(
      jwtData.mentorshipId,
      {
        mentorship_status: STATUS.CANCEL,
        cancel_cause: cancelCause,
        who_cancel: whoCancel,
      },
      ["mentorship_status", "cancel_cause", "who_cancel"]
    );

    const { mentee_name, mentee_email, mentor_name, mentor_email } =
      mentorshipUpdated.Attributes;

    const mentorshipDate = new Date(jwtData.date);

    const htmlMentee = cancelMail({
      mentorName: mentor_name,
      menteeName: mentee_name,
      date: toDateString(mentorshipDate),
      time: toTimeString(mentorshipDate),
      forMentor: false,
    });
    sendEmail(mentee_email, `Hola ${mentee_name}!`, htmlMentee);
    const htmlMentor = cancelMail({
      mentorName: mentor_name,
      menteeName: mentee_name,
      date: toDateString(mentorshipDate),
      time: toTimeString(mentorshipDate),
      forMentor: true,
    });
    sendEmail(mentor_email, `Hola ${mentor_name}!`, htmlMentor);

    return makeSuccessResponse(mentorshipUpdated.Attributes, "0");
  } catch (error) {
    return makeErrorResponse(500, "-104");
  }

  //TODO: Send cancel discord dm to the mentor and mentee
};

export const reminderMentorship = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  const {
    responseData: {
      mentorship: { mentorEmail, menteeEmail, mentorName, menteeName },
      token,
      mentorshipDate,
    },
  } = event;
  const date = new Date(mentorshipDate);
  const htmlMentee = reminderMail({
    mentorName,
    menteeName,
    date: toDateString(mentorshipDate),
    time: toTimeString(mentorshipDate),
    forMentor: false,
    cancelLink: `${process.env.BASE_FRONT_URL}/cancel?token=${token}`,
    confirmationLink: `${process.env.BASE_FRONT_URL}/confirmation?token=${token}`,
  });
  sendEmail(menteeEmail, `Hola ${menteeName}!`, htmlMentee);
  const htmlMentor = reminderMail({
    mentorName,
    menteeName,
    date: toDateString(mentorshipDate),
    time: toTimeString(mentorshipDate),
    forMentor: true,
    cancelLink: `${process.env.BASE_FRONT_URL}/cancel?token=${token}`,
    confirmationLink: `${process.env.BASE_FRONT_URL}/confirmation?token=${token}`,
  });
  await sendEmail(mentorEmail, `Hola ${mentorName}!`, htmlMentor);
  const responseCode: keyof typeof RESPONSE_CODES = "0";
  return throwLambdaResponse(callback, {
    responseMessage: RESPONSE_CODES[responseCode],
    responseCode,
  });
  //TODO: Send reminder discord dm to the mentor and mentee
};

export const updateRoleMentorship = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  //TODO: Add or delete discord role to the mentee
};

export const sendFeedbackFormMentorship = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const {
    responseData: {
      mentorship: { menteeEmail, mentorName, menteeName },
      token,
    },
  } = event;

  const htmlMentee = feedbackMail({
    mentorName,
    menteeName,
    feedbackLink: `${process.env.BASE_FRONT_URL}/feedback?token=${token}`,
  });
  sendEmail(menteeEmail, `Hola ${menteeName}!`, htmlMentee);
  const responseCode: keyof typeof RESPONSE_CODES = "0";
  return throwLambdaResponse(callback, {
    responseMessage: RESPONSE_CODES[responseCode],
    responseCode,
    responseData: event.responseData,
  });

  //TODO: Send feedback form dm to the mentee
};

export const feedbackFormMentorship: APIGatewayProxyHandler = async (event) => {
  const { token, feedback, privateFeedback, starsFeedback } = JSON.parse(
    event.body
  );
  const jwtData: any = jwt.verify(token, process.env.JWT_KEY);

  try {
    const {
      Item: { mentorship_status, feedback_stars, feedback_mentee },
    } = await getMentorshipById(jwtData.mentorshipId);

    if (mentorship_status !== STATUS.CONFIRMED) {
      return makeErrorResponse(400, "-111");
    }

    if (feedback_stars > 0 && feedback_mentee !== "") {
      return makeErrorResponse(400, "-112");
    }

    const mentorshipUpdated = await updateMentorship(
      jwtData.mentorshipId,
      {
        feedback_mentee: feedback,
        feedback_mentee_private: privateFeedback,
        feedback_stars: starsFeedback,
      },
      ["feedback_mentee", "feedback_mentee_private", "feedback_stars"]
    );

    return makeSuccessResponse(mentorshipUpdated.Attributes, "102");
  } catch (error) {
    return makeErrorResponse(500, "-110", error);
  }
};

export const checkCancelFunction = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { token } = event.responseData;
  const jwtData: any = jwt.verify(token, process.env.JWT_KEY);

  const paramsGet = {
    TableName: TABLE_NAME_MENTORSHIP,
    Key: { id: jwtData.mentorshipId },
  };

  dynamoDb.get(paramsGet, async (err, data) => {
    if (err) {
      return throwLambdaResponse(callback, {
        is_cancel: false,
        responseData: event.responseData,
      });
    }
    return throwLambdaResponse(callback, {
      is_cancel: data.Item?.mentorship_status === STATUS.CANCEL,
      responseData: event.responseData,
    });
  });
};

export const confirmationMentorship: APIGatewayProxyHandler = async (event) => {
  const { token } = JSON.parse(event.body);
  const jwtData: any = jwt.verify(token, process.env.JWT_KEY);

  try {
    const mentorship = await getMentorshipById(jwtData.mentorshipId);

    if (mentorship.Item?.mentorship_status !== STATUS.ACTIVE) {
      return makeErrorResponse(400, "-109");
    }

    const { Attributes } = await updateMentorship(
      jwtData.mentorshipId,
      { mentorship_status: STATUS.CONFIRMED },
      ["mentorship_status"]
    );
    return makeSuccessResponse(Attributes, "101");
  } catch (error) {
    return makeErrorResponse(400, "-110", error);
  }
};

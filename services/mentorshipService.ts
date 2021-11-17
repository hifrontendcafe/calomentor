import { Callback, Context } from "aws-lambda";
import { throwLambdaResponse, throwResponse } from "../utils/throwResponse";
import {
  RESPONSE_CODES,
  STATUS,
  TABLE_NAME_MENTORSHIP,
  TABLE_NAME_USER,
  TABLE_NAME_TIME_SLOT,
  FILTERDATES,
} from "../constants";

import { fillTimeSlot, freeTimeSlot } from "../repository/timeSlot";
import { v4 as uuidv4 } from "uuid";
import { isPast, subDays } from "date-fns";
import { format, zonedTimeToUtc } from "date-fns-tz";
import { sendEmail } from "../utils/sendEmail";
const jwt = require("jsonwebtoken");
import { confirmationMail } from "../mails/confirmation";
import { cancelMail } from "../mails/cancel";
import { reminderMail } from "../mails/reminder";
import { feedbackMail } from "../mails/feedback";
import { toDateString, toTimeString } from "../utils/dates";

const axios = require("axios");

const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const createMentorship = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const {
    mentor_id,
    mentee_id,
    mentee_name,
    mentee_username_discord,
    mentee_email,
    info,
    time_slot_id,
  } = event;

  if (!mentor_id || !mentee_id || !mentee_email || !time_slot_id) {
    const responseCode = "-100";
    return throwLambdaResponse(callback, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
    });
  }

  const mentorship = {
    id: uuidv4(),
    mentor_id,
    mentor_email: "",
    mentor_name: "",
    tokenForCancel: "",
    mentee_id,
    mentee_name,
    mentee_username_discord,
    mentee_email,
    info,
    mentorship_status: STATUS.ACTIVE,
    time_slot_id,
    cancel_cause: "",
    who_cancel: "",
    feedback_mentee: "",
    feedback_stars: 0,
    feedback_mentee_private: "",
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
        const responseCode = "-103";
        return throwLambdaResponse(callback, {
          responseMessage: RESPONSE_CODES[responseCode],
          responseCode,
        });
      }
      const slot = timeSlotData.Item;

      const mentorshipDate = new Date(slot.date);
      dateToRemind = subDays(mentorshipDate, 1);

      dynamoDb.get(paramsUserId, (err, data) => {
        if (err) {
          const responseCode = "-101";
          return throwLambdaResponse(callback, {
            responseMessage: RESPONSE_CODES[responseCode],
            responseCode,
          });
        } else {
          if (Object.keys(data).length === 0) {
            const responseCode = "-101";
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
                const responseCode = "-102";
                return throwLambdaResponse(callback, {
                  responseMessage: RESPONSE_CODES[responseCode],
                  responseCode,
                });
              } else {
                try {
                  await fillTimeSlot(mentorship.time_slot_id);

                  await axios({
                    method: "PATCH",
                    headers: { "x-api-key": process.env.API_KEY },
                    data: JSON.stringify({
                      id: mentorship.time_slot_id,
                      mentee_username: mentee_username_discord,
                      mentee_id: mentee_id,
                      tokenForCancel: token,
                    }),
                    url: `${process.env.BASE_URL}/time-slot/mentee`,
                  });

                  await dynamoDb
                    .update({
                      TableName: TABLE_NAME_TIME_SLOT,
                      Key: {
                        id: mentorship.time_slot_id,
                      },
                      ExpressionAttributeValues: {
                        ":is_occupied": true,
                      },
                      UpdateExpression: "SET is_occupied = :is_occupied",
                      ReturnValues: "ALL_NEW",
                    })
                    .promise();

                  await dynamoDb
                    .update({
                      TableName: TABLE_NAME_TIME_SLOT,
                      Key: {
                        id: mentorship.time_slot_id,
                      },
                      ExpressionAttributeValues: {
                        ":mentee_id": mentee_username_discord,
                        ":mentee_username": mentee_id,
                        ":tokenForCancel": token,
                      },
                      UpdateExpression:
                        "SET mentee_id = :mentee_id, mentee_username = :mentee_username, tokenForCancel = :tokenForCancel",
                      ReturnValues: "ALL_NEW",
                    })
                    .promise();

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
                  const responseCode = "-1";
                  return throwLambdaResponse(callback, {
                    responseMessage: RESPONSE_CODES[responseCode],
                    responseCode,
                    responseError: error,
                  });
                }
                const responseCode = "100";
                return throwLambdaResponse(callback, {
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
      const responseCode = "-1";
      return throwLambdaResponse(callback, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
      });
    }
  });
  //TODO: Send confirmation discord dm to the mentor and mentee
};

export const cancelMentorship = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  const { cancelCause, whoCancel } = JSON.parse(event.body);
  const { token } = event.queryStringParameters;
  const jwtData: any = jwt.verify(token, process.env.JWT_KEY);

  const paramsGet = {
    TableName: TABLE_NAME_MENTORSHIP,
    Key: { id: jwtData.mentorshipId },
  };

  try {
    const mentorship = await dynamoDb.get(paramsGet).promise();

    if (mentorship.Item?.mentorship_status === STATUS.CANCEL) {
      const responseCode = "-109";
      return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
      });
    }

    await freeTimeSlot(mentorship.Item?.time_slot_id);

    await dynamoDb
      .update({
        TableName: TABLE_NAME_TIME_SLOT,
        Key: {
          id: mentorship.Item?.time_slot_id,
        },
        ExpressionAttributeValues: {
          ":mentee_id": "",
          ":mentee_username": "",
          ":tokenForCancel": "",
        },
        UpdateExpression:
          "SET mentee_id = :mentee_id, mentee_username = :mentee_username, tokenForCancel = :tokenForCancel",
        ReturnValues: "ALL_NEW",
      })
      .promise();

    const mentorshipUpdated = await dynamoDb
      .update({
        TableName: TABLE_NAME_MENTORSHIP,
        Key: { id: jwtData.mentorshipId },
        ExpressionAttributeValues: {
          ":mentorship_status": STATUS.CANCEL,
          ":cancel_cause": cancelCause,
          ":who_cancel": whoCancel,
        },
        UpdateExpression:
          "SET mentorship_status = :mentorship_status, cancel_cause = :cancel_cause, who_cancel = :who_cancel",
        ReturnValues: "ALL_NEW",
      })
      .promise();

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
    const responseCode = "0";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 200, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      data: mentorshipUpdated.Attributes,
    });
  } catch (error) {
    const responseCode = "-104";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      error: error,
    });
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
  const responseCode = "0";
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
  const responseCode = "0";
  return throwLambdaResponse(callback, {
    responseMessage: RESPONSE_CODES[responseCode],
    responseCode,
    responseData: event.responseData,
  });

  //TODO: Send feedback form dm to the mentee
};

export const feedbackFormMentorship = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  const { token, feedback, privateFeedback, starsFeedback } = JSON.parse(
    event.body
  );
  const jwtData: any = jwt.verify(token, process.env.JWT_KEY);

  const paramsGet = {
    TableName: TABLE_NAME_MENTORSHIP,
    Key: { id: jwtData.mentorshipId },
  };

  try {
    const mentorship = await dynamoDb.get(paramsGet).promise();

    if (mentorship.Item?.mentorship_status !== STATUS.CONFIRMED) {
      const responseCode = "-111";
      return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
      });
    }

    if (
      mentorship.Item?.feedback_stars > 0 &&
      mentorship.Item?.feedback_mentee !== ""
    ) {
      const responseCode = "-112";
      return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
      });
    }

    const paramsUpdate = {
      TableName: TABLE_NAME_MENTORSHIP,
      Key: { id: jwtData.mentorshipId },
      ExpressionAttributeValues: {
        ":feedback_mentee": feedback,
        ":feedback_mentee_private": privateFeedback,
        ":feedback_stars": starsFeedback,
      },
      UpdateExpression:
        "SET feedback_mentee = :feedback_mentee, feedback_mentee_private = :feedback_mentee_private, feedback_stars = :feedback_stars",
      ReturnValues: "ALL_NEW",
    };

    const updateMentorship = await dynamoDb.update(paramsUpdate).promise();

    const responseCode = "102";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 200, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      responseData: updateMentorship.Attributes,
    });
  } catch (error) {
    const responseCode = "-110";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      error,
    });
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

export const confirmationMentorship = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  const { token } = JSON.parse(event.body);
  const jwtData: any = jwt.verify(token, process.env.JWT_KEY);

  const paramsGet = {
    TableName: TABLE_NAME_MENTORSHIP,
    Key: { id: jwtData.mentorshipId },
  };

  try {
    const mentorship = await dynamoDb.get(paramsGet).promise();

    if (mentorship.Item?.mentorship_status !== STATUS.ACTIVE) {
      const responseCode = "-109";
      return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
      });
    }

    const paramsUpdate = {
      TableName: TABLE_NAME_MENTORSHIP,
      Key: { id: jwtData.mentorshipId },
      ExpressionAttributeValues: {
        ":mentorship_status": STATUS.CONFIRMED,
      },
      UpdateExpression: "SET mentorship_status = :mentorship_status",
      ReturnValues: "ALL_NEW",
    };

    const updateMentorship = await dynamoDb.update(paramsUpdate).promise();

    const responseCode = "101";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 200, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      responseData: updateMentorship.Attributes,
    });
  } catch (error) {
    const responseCode = "-110";
    return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
      responseMessage: RESPONSE_CODES[responseCode],
      responseCode,
      error,
    });
  }

  //TODO: Enviar dm al mentor confirmando la mentoria
  //TODO: Enviar mail al mentor confirmando la mentoria
};

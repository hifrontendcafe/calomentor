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
import { v4 as uuidv4 } from "uuid";
import { addHours, isFuture, isPast, subHours } from "date-fns";
import { sendEmail } from "../utils/sendEmail";
const jwt = require("jsonwebtoken");
import { confirmationMail } from "../mails/confirmation";
import { cancelMail } from "../mails/cancel";
import { reminderMail } from "../mails/reminder";

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

      dateToRemind = subHours(new Date(slot.date), 2);

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
                date: dateToRemind.getTime(),
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
                  await axios({
                    method: "PATCH",
                    headers: { "x-api-key": process.env.API_KEY },
                    data: JSON.stringify({
                      id: mentorship.time_slot_id,
                      is_occupied: true,
                    }),
                    url: `${process.env.BASE_URL}/time-slot`,
                  });

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

                  const htmlMentee = confirmationMail({
                    mentorName: data.Item?.full_name,
                    menteeName: mentee_name,
                    date: dateToRemind.toLocaleDateString("es-AR"),
                    time: dateToRemind.toLocaleTimeString("es-AR"),
                    cancelLink: `${process.env.BASE_FRONT_URL}/cancel-mentorship?=${token}`,
                    forMentor: false,
                  });
                  sendEmail(
                    mentorship.mentee_email,
                    `Hola Mentee ${mentee_name} `,
                    htmlMentee
                  );
                  const htmlMentor = confirmationMail({
                    mentorName: data.Item?.full_name,
                    menteeName: mentee_name,
                    date: dateToRemind.toLocaleDateString("es-AR"),
                    time: dateToRemind.toLocaleTimeString("es-AR"),
                    cancelLink: `${process.env.BASE_FRONT_URL}/cancel-mentorship?=${token}`,
                    forMentor: true,
                  });
                  sendEmail(
                    data.Item?.email,
                    `Hola Mentor ${data.Item?.full_name} `,
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
                    dateToRemind: dateToRemind,
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

export const cancelMentorship = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { cancelCause, whoCancel } = JSON.parse(event.body);
  const { token } = event.queryStringParameters;
  const jwtData: any = jwt.verify(token, process.env.JWT_KEY);

  const paramsGet = {
    TableName: TABLE_NAME_MENTORSHIP,
    Key: { id: jwtData.mentorshipId },
  };

  dynamoDb.get(paramsGet, async (err, data) => {
    if (err) {
      const responseCode = "-104";
      return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
        error: err,
      });
    }

    if (data.Item?.mentorship_status === STATUS.CANCEL) {
      const responseCode = "-109";
      return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
        error: err,
      });
    }

    await axios({
      method: "PATCH",
      headers: { "x-api-key": process.env.API_KEY },
      data: JSON.stringify({
        id: data.Item?.time_slot_id,
        is_occupied: false,
      }),
      url: `${process.env.BASE_URL}/time-slot`,
    });

    await axios({
      method: "PATCH",
      headers: { "x-api-key": process.env.API_KEY },
      data: JSON.stringify({
        id: data.Item?.time_slot_id,
        mentee_username: "",
        mentee_id: "",
        tokenForCancel: "",
      }),
      url: `${process.env.BASE_URL}/time-slot/mentee`,
    });

    const params = {
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
    };

    dynamoDb.update(params, async (error, resMentorship) => {
      if (error) {
        const responseCode = "-105";
        return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
          responseMessage: RESPONSE_CODES[responseCode],
          responseCode,
          error,
        });
      }
      const { mentee_name, mentee_email, mentor_name, mentor_email } =
        resMentorship.Attributes;

      const dateToRemind = addHours(new Date(jwtData.date), 2);

      const htmlMentee = cancelMail({
        mentorName: mentor_name,
        menteeName: mentee_name,
        date: dateToRemind.toLocaleDateString("es-AR"),
        time: dateToRemind.toLocaleTimeString("es-AR"),
        forMentor: false,
      });
      sendEmail(mentee_email, `Hola ${mentee_name} `, htmlMentee);
      const htmlMentor = cancelMail({
        mentorName: mentor_name,
        menteeName: mentee_name,
        date: dateToRemind.toLocaleDateString("es-AR"),
        time: dateToRemind.toLocaleTimeString("es-AR"),
        forMentor: true,
      });
      sendEmail(mentor_email, `Hola ${mentor_name} `, htmlMentor);
      const responseCode = "0";
      return throwResponse(callback, RESPONSE_CODES[responseCode], 200, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
        data: resMentorship.Attributes,
      });
    });
  });

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
      dateToRemind,
    },
  } = event;
  const date = addHours(new Date(dateToRemind), 2);
  const htmlMentee = reminderMail({
    mentorName,
    menteeName,
    date: date.toLocaleDateString("es-AR"),
    time: date.toLocaleTimeString("es-AR"),
    forMentor: false,
    cancelLink: `${process.env.BASE_FRONT_URL}/cancel-mentorship?=${token}`,
    confirmationLink: `${process.env.BASE_FRONT_URL}/confirmation-mentorship?=${token}`,
  });
  sendEmail(menteeEmail, `HOLA ${menteeName} `, htmlMentee);
  const htmlMentor = reminderMail({
    mentorName,
    menteeName,
    date: date.toLocaleDateString("es-AR"),
    time: date.toLocaleTimeString("es-AR"),
    forMentor: true,
    cancelLink: `${process.env.BASE_FRONT_URL}/cancel-mentorship?=${token}`,
    confirmationLink: `${process.env.BASE_FRONT_URL}/confirmation-mentorship?=${token}`,
  });
  await sendEmail(mentorEmail, `HOLA ${mentorName} `, htmlMentor);
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
  //TODO: Send feedback form mail to the mentee
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

export const getMentorships = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const mentorId = event.pathParameters?.id;
  const filter = event.queryStringParameters?.filter;
  const filterDates = event.queryStringParameters?.filterDates;

  const paramsWithUserId = {
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression: "mentor_id = :mentor_id",
    ExpressionAttributeValues: {
      ":mentor_id": mentorId,
    },
  };

  const paramsAll = {
    TableName: TABLE_NAME_TIME_SLOT,
  };

  dynamoDb.scan(mentorId ? paramsWithUserId : paramsAll, async (err, data) => {
    if (err) {
      const responseCode = "-107";
      return throwResponse(callback, RESPONSE_CODES[responseCode], 400, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
        error: err,
      });
    }
    if (data.Items?.length === 0) {
      const responseCode = "-108";
      return throwResponse(callback, RESPONSE_CODES[responseCode], 404, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
      });
    }

    let mentorshipsData = data.Items;

    if (filter === STATUS.ACTIVE) {
      mentorshipsData = mentorshipsData.filter(
        (mt) => mt.mentorship_status === STATUS.ACTIVE
      );
    } else if (filter === STATUS.CANCEL) {
      mentorshipsData = mentorshipsData.filter(
        (mt) => mt.mentorship_status === STATUS.CANCEL
      );
    } else if (filter === STATUS.CONFIRMED) {
      mentorshipsData = mentorshipsData.filter(
        (mt) => mt.mentorship_status === STATUS.CONFIRMED
      );
    }

    const responseData = await Promise.all(
      mentorshipsData.map(async (ment) => {
        const timeSlotInfo = await dynamoDb
          .get({
            TableName: TABLE_NAME_TIME_SLOT,
            Key: { id: ment.time_slot_id },
          })
          .promise();

        if (!timeSlotInfo) {
          return ment;
        }

        let mentorshipInfo = ment;

        if (
          filterDates === FILTERDATES.PAST &&
          isPast(new Date(timeSlotInfo.Item?.date))
        ) {
          ment.time_slot_info = timeSlotInfo?.Item;
          mentorshipInfo = ment;
        } else if (
          filterDates === FILTERDATES.FUTURE &&
          !isPast(new Date(timeSlotInfo.Item?.date))
        ) {
          ment.time_slot_info = timeSlotInfo?.Item;
          mentorshipInfo = ment;
        } else if (!filterDates) {
          ment.time_slot_info = timeSlotInfo?.Item;
          mentorshipInfo = ment;
        }

        delete mentorshipInfo?.time_slot_id;
        delete mentorshipInfo?.feedback_mentee_private;
        delete mentorshipInfo?.time_slot_info?.user_id;
        delete mentorshipInfo?.time_slot_info?.tokenForCancel;
        delete mentorshipInfo?.time_slot_info?.mentee_id;
        delete mentorshipInfo?.time_slot_info?.mentee_username;

        return mentorshipInfo;
      })
    );

    const responseCode = "0";
    return throwResponse(
      callback,
      RESPONSE_CODES[responseCode],
      200,
      responseData.filter((m) => m)
    );
  });

  //TODO: Validate admin
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

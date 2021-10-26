import { Callback, Context } from "aws-lambda";
import { throwMentorshipResponse, throwResponse } from "../utils/throwResponse";
import {
  RESPONSE_CODES,
  STATUS,
  TABLE_NAME_MENTORSHIP,
  TABLE_NAME_USER,
  TABLE_NAME_TIME_SLOT,
} from "../constants";
import { v4 as uuidv4 } from "uuid";
import { addHours, subHours } from "date-fns";
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
    return throwMentorshipResponse(callback, {
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
        return throwMentorshipResponse(callback, {
          responseMessage: RESPONSE_CODES[responseCode],
          responseCode,
        });
      }
      const slot = timeSlotData.Item;

      dateToRemind = subHours(new Date(slot.date), 2);

      dynamoDb.get(paramsUserId, (err, data) => {
        if (err) {
          const responseCode = "-101";
          return throwMentorshipResponse(callback, {
            responseMessage: RESPONSE_CODES[responseCode],
            responseCode,
          });
        } else {
          if (Object.keys(data).length === 0) {
            const responseCode = "-101";
            return throwMentorshipResponse(callback, {
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
                return throwMentorshipResponse(callback, {
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
                  return throwMentorshipResponse(callback, {
                    responseMessage: RESPONSE_CODES[responseCode],
                    responseCode,
                    responseError: error,
                  });
                }
                const responseCode = "100";
                return throwMentorshipResponse(callback, {
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
      return throwMentorshipResponse(callback, {
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
  const { cancelCause } = JSON.parse(event.body);
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

    if (data.Item?.mentorship_status) {
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
      },
      UpdateExpression:
        "SET mentorship_status = :mentorship_status, cancel_cause = :cancel_cause",
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
      const { mentee_name, mentee_email, mentor_name, mentor_mail } =
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
      sendEmail(mentor_mail, `Hola ${mentor_name} `, htmlMentor);
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
  return throwMentorshipResponse(callback, {
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

export const feedbackFormMentorship = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  //TODO: Send feedback form mail to the mentee
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
      return throwMentorshipResponse(callback, {
        is_cancel: false,
      });
    }
    return throwMentorshipResponse(callback, {
      is_cancel: data.Item?.mentorship_status === STATUS.CANCEL,
    });
  });
};

export const getMentorships = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const mentorId = event.pathParameters?.id;

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

    const responseData = await Promise.all(
      data.Items?.map(async (ment) => {
        const timeSlotInfo = await axios({
          method: "GET",
          headers: { "x-api-key": process.env.API_KEY },
          url: `${process.env.BASE_URL}/time-slot/${ment.time_slot_id}`,
        });
        ment.time_slot_info = timeSlotInfo?.data?.data;
        return ment;
      })
    );

    const responseCode = "0";
    return throwResponse(
      callback,
      RESPONSE_CODES[responseCode],
      200,
      responseData
    );
  });

  //TODO: Validate admin
  //TODO: Solo enviar mentorias futuras
  //TODO: Eliminar datos duplicados en la respuesta
};

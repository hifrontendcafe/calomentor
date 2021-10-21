import { Callback, Context } from "aws-lambda";
import { throwMentorshipResponse } from "../utils/throwResponse";
import {
  RESPONSE_CODES,
  STATUS,
  TABLE_NAME_MENTORSHIP,
  TABLE_NAME_USER,
  TABLE_NAME_TIME_SLOT,
} from "../constants";
import { v4 as uuidv4 } from "uuid";
const { utcToZonedTime } = require("date-fns-tz");
import { sendEmail } from "../utils/sendEmail";
import jwt from "jsonwebtoken";
import { confirmationMail } from "../mails/confirmation";
import { cancelMail } from "../mails/cancel";
import { reminderMail } from "../mails/reminder";
import timezones from "../constants/timezones.json";

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
    mentor_mail: "",
    mentor_name: "",
    tokenForCancel: "",
    mentee_id,
    mentee_name,
    mentee_username_discord,
    mentee_email,
    info,
    status: STATUS.ACTIVE,
    time_slot_id,
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
      const [day, month, year] = slot.slot_date.split("/");
      const [hours, minutes] = slot.slot_time.split(":");

      dateToRemind = new Date(
        year,
        month,
        day,
        parseInt(hours),
        parseInt(minutes)
      );

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
            mentorship.mentor_mail = data.Item?.email;
            mentorship.mentor_name = data.Item?.full_name;
            const params = {
              TableName: TABLE_NAME_MENTORSHIP,
              Item: mentorship,
            };

            const timezone = timezones.find(
              (tz) => tz.id === data.Item?.timeZone
            );

            if (!timezone) {
              const responseCode = "-105";
              return throwMentorshipResponse(callback, {
                responseMessage: RESPONSE_CODES[responseCode],
                responseCode,
              });
            }

            dateToRemind = utcToZonedTime(
              dateToRemind,
              timezone.value[0] || "America/Buenos_Aires"
            );

            dateToRemind.setHours(dateToRemind.getHours() - 2);

            dynamoDb.put(params, async (error, resMentorship) => {
              if (error) {
                const responseCode = "-102";
                return throwMentorshipResponse(callback, {
                  responseMessage: RESPONSE_CODES[responseCode],
                  responseCode,
                });
              } else {
                const token = jwt.sign(
                  {
                    menteeEmail: mentorship.mentee_email,
                    mentorshipId: data.Item?.id,
                    date: dateToRemind,
                  },
                  process.env.JWT_KEY,
                  {
                    expiresIn: "90d",
                  }
                );

                await axios.patch(`${process.env.BASE_URL}/time-slot`, {
                  id: mentorship.time_slot_id,
                  is_occupied: true,
                });

                await axios.patch(`${process.env.BASE_URL}/time-slot/mentee`, {
                  id: mentorship.time_slot_id,
                  slot: {
                    mentee_username: mentee_username_discord,
                    mentee_id: mentee_id,
                    tokenForCancel: token,
                  },
                });
                const responseCode = "100";
                const htmlMentee = confirmationMail({
                  mentorName: data.Item?.full_name,
                  menteeName: mentee_name,
                  date: dateToRemind.toLocaleDateString("es-AR"),
                  time: dateToRemind.toLocaleTimeString("es-AR"),
                  cancelLink: `${process.env.BASE_FRONT_URL}/cancel-mentorship?=${token}`,
                  forMentor: false,
                });
                await sendEmail(
                  mentorship.mentee_email,
                  `HOLA ${mentee_name} `,
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
                await sendEmail(
                  data.Item?.email,
                  `HOLA ${data.Item?.full_name} `,
                  htmlMentor
                );
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
                    dateToRemind,
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
  const { token } = event.pathParameters;
  const jwtData: any = jwt.verify(token, process.env.JWT_KEY);

  const paramsGet = {
    TableName: TABLE_NAME_MENTORSHIP,
    Key: { id: jwtData.mentorshipId },
  };

  dynamoDb.get(paramsGet, async (err, data) => {
    if (err) {
      const responseCode = "-104";
      return throwMentorshipResponse(callback, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
      });
    }

    await axios.patch(`${process.env.BASE_URL}/time-slot`, {
      id: data.Item?.time_slot_id,
      is_occupied: false,
    });

    await axios.patch(`${process.env.BASE_URL}/time-slot/mentee`, {
      id: data.Item?.time_slot_id,
      slot: {
        mentee_username: "",
        mentee_id: "",
        tokenForCancel: "",
      },
    });

    const params = {
      TableName: TABLE_NAME_MENTORSHIP,
      Key: { id: jwtData.mentorshipId },
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": STATUS.CANCEL,
      },
      UpdateExpression: "SET status = :status",
      ReturnValues: "ALL_NEW",
    };

    dynamoDb.update(params, async (error, resMentorship) => {
      if (error) {
        const responseCode = "-105";
        return throwMentorshipResponse(callback, {
          responseMessage: RESPONSE_CODES[responseCode],
          responseCode,
        });
      }
      const { mentee_name, mentee_email, mentor_name, mentor_email } =
        resMentorship.Item;

      const dateToRemind = new Date(jwtData.date);

      const htmlMentee = cancelMail({
        mentorName: mentor_name,
        menteeName: mentee_name,
        date: dateToRemind.toLocaleDateString("es-AR"),
        time: dateToRemind.toLocaleTimeString("es-AR"),
        forMentor: false,
      });
      await sendEmail(mentee_email, `HOLA ${mentee_name} `, htmlMentee);
      const htmlMentor = cancelMail({
        mentorName: mentor_name,
        menteeName: mentee_name,
        date: dateToRemind.toLocaleDateString("es-AR"),
        time: dateToRemind.toLocaleTimeString("es-AR"),
        forMentor: true,
      });
      await sendEmail(mentor_email, `HOLA ${mentor_name} `, htmlMentor);
      const responseCode = "0";
      return throwMentorshipResponse(callback, {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
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
  const htmlMentee = reminderMail({
    mentorName,
    menteeName,
    date: dateToRemind.toLocaleDateString("es-AR"),
    time: dateToRemind.toLocaleTimeString("es-AR"),
    forMentor: false,
    cancelLink: `${process.env.BASE_FRONT_URL}/cancel-mentorship?=${token}`,
    confirmationLink: `${process.env.BASE_FRONT_URL}/confirmation-mentorship?=${token}`,
  });
  const sendMentee = await sendEmail(
    menteeEmail,
    `HOLA ${menteeName} `,
    htmlMentee
  );
  const htmlMentor = reminderMail({
    mentorName,
    menteeName,
    date: dateToRemind.toLocaleDateString("es-AR"),
    time: dateToRemind.toLocaleTimeString("es-AR"),
    forMentor: true,
    cancelLink: `${process.env.BASE_FRONT_URL}/cancel-mentorship?=${token}`,
    confirmationLink: `${process.env.BASE_FRONT_URL}/confirmation-mentorship?=${token}`,
  });
  const sendMentor = await sendEmail(
    mentorEmail,
    `HOLA ${mentorName} `,
    htmlMentor
  );
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      code: 200,
      message: "success",
      data: {
        sendMentee,
        sendMentor,
      },
    }),
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
  const { token } = event.pathParameters;
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
      is_cancel: data.Item?.status === STATUS.CANCEL,
    });
  });
};

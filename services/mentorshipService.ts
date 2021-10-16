import { Callback, Context } from "aws-lambda";
import { createAndUpdateUserValidations } from "../utils/validations";
import { throwMentorshipResponse } from "../utils/throwResponse";
import {
  RESPONSE_CODES,
  STATUS,
  TABLE_NAME_MENTORSHIP,
  TABLE_NAME_USER,
  TABLE_NAME_TIME_SLOT,
} from "../constants";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../utils/sendEmail";
import jwt from "jsonwebtoken";

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
    time_slot_time,
  } = event;

  if (
    !mentor_id ||
    !mentee_id ||
    !mentee_email ||
    !time_slot_id ||
    !time_slot_time
  ) {
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
    mentee_id,
    mentee_name,
    mentee_username_discord,
    mentee_email,
    info,
    status: STATUS.ACTIVE,
    time_slot_id,
    time_slot_time,
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
      const [hours, minutes] = mentorship.time_slot_time.split(":");
      dateToRemind = new Date(
        year,
        month,
        day,
        parseInt(hours),
        parseInt(minutes)
      );

      dateToRemind.setHours(dateToRemind.getHours() - 2);

      await axios.patch(`${process.env.BASE_URL}/time-slot`, {
        id: mentorship.time_slot_id,
        is_occupied: true,
      });

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
                  },
                  process.env.JWT_KEY,
                  {
                    expiresIn: "30d",
                  }
                );
                const responseCode = "100";
                const htmlMentee = `<div><span>Hola ${mentee_name} Confirmación de mentoria con ${data.Item?.full_name}, token para cancelar la mentoria ${token}</span></div>`;
                await sendEmail(
                  mentorship.mentee_email,
                  `HOLA ${mentee_name} `,
                  htmlMentee
                );
                const htmlMentor = `<div><span>Hola ${data.Item?.full_name} Confirmación de mentoria con ${mentee_name}</span></div>`;
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
  //TODO: Add design to mails
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

      const htmlMentee = `<div><span>Hola ${mentee_name} Confirmación de mentoria con ${mentor_name}</span></div>`;
      await sendEmail(mentee_email, `HOLA ${mentee_name} `, htmlMentee);
      const htmlMentor = `<div><span>Hola ${mentor_name} Confirmación de mentoria con ${mentee_name}</span></div>`;
      await sendEmail(mentor_email, `HOLA ${mentor_name} `, htmlMentor);
    });
  });
  //TODO: Send cancel discord dm to the mentor and mentee
  //TODO: Add design to mails
};

export const reminderMentorship = async (
  event: any,
  context: Context,
  callback: Callback<any>
): Promise<void> => {
  const {
    responseData: {
      mentorship: { mentorEmail, menteeEmail, mentorName, menteeName },
    },
  } = event;
  const htmlMentee = `<div><span>Hola ${menteeName} Recordatorio de mentoria con ${mentorName}</span></div>`;
  const sendMentee = await sendEmail(
    menteeEmail,
    `HOLA ${menteeName} `,
    htmlMentee
  );
  const htmlMentor = `<div><span>Hola ${mentorName} Recordatorio de mentoria con ${menteeName}</<span></div>`;
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
      data: {},
    }),
  });
  //TODO: Send reminder discord dm to the mentor and mentee
  //TODO: Add design to mails
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

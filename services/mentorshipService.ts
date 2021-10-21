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

const axios = require("axios");

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

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
        slot: {
          time: mentorship.time_slot_time,
          is_occupied: true,
        },
      });

      await axios.patch(`${process.env.BASE_URL}/time-slot/mentee`, {
        id: mentorship.time_slot_id,
        slot: {
          mentee_username: mentee_username_discord,
          mentee_id: mentee_id,
        },
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
                const responseCode = "100";
                const htmlMentee = `<div><span>Hola ${mentee_name} Confirmación de mentoria con ${data.Item?.full_name}</span></div>`;
                const sendMentee = await sendEmail(
                  mentorship.mentee_email,
                  `HOLA ${mentee_name} `,
                  htmlMentee
                );
                const htmlMentor = `<div><span>Hola ${data.Item?.full_name} Confirmación de mentoria con ${mentee_name}</span></div>`;
                const sendMentor = await sendEmail(
                  data.Item?.email,
                  `HOLA ${data.Item?.full_name} `,
                  htmlMentor
                );
                console.log("MENT", resMentorship);
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
  // await axios.patch(`${process.env.BASE_URL}/time-slot/mentee`, {
  //   id: time_slot_id,
  //   slot: {
  //     mentee_username: "",
  //     mentee_id: "",
  //   },
  // });
  //TODO: Cancel mentorship
  //TODO: Send cancel emails to mentor and mentee
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

import { Handler } from "aws-lambda";
import { RESPONSE_CODES } from "../../../constants";
import { reminderMail } from "../../../mails/reminder";
import { MentorshipResponse } from "../../../types";
import { toDateString, toTimeString } from "../../../utils/dates";
import { createICS } from "../../../utils/ical";
import { makeLambdaResponse } from "../../../utils/makeResponses";
import { sendEmail } from "../../../utils/sendEmail";

const reminderMentorship: Handler = async (event, _, callback) => {
  const {
    responseData: {
      mentorship: {
        mentorEmail,
        menteeEmail,
        mentorName,
        menteeName,
        menteeTimezone,
        mentorTimezone,
        mentorshipId,
      },
      token,
      mentorshipDate,
    },
  } = event;
  const date = new Date(mentorshipDate);
  const htmlMentee = reminderMail({
    mentorName,
    menteeName,
    date: toDateString(mentorshipDate, menteeTimezone),
    time: toTimeString(mentorshipDate, menteeTimezone),
    forMentor: false,
    cancelLink: `${process.env.BASE_FRONT_URL}/cancel?token=${token}`,
    confirmationLink: `${process.env.BASE_FRONT_URL}/confirmation?token=${token}`,
  });
  sendEmail(
    menteeEmail,
    `Hola ${menteeName}!`,
    htmlMentee,
    createICS(date, menteeName, {
      mentorshipId,
      menteeEmail,
      menteeName,
      mentorEmail,
      mentorName,
      timezone: menteeTimezone,
    })
  );
  const htmlMentor = reminderMail({
    mentorName,
    menteeName,
    date: toDateString(mentorshipDate, mentorTimezone),
    time: toTimeString(mentorshipDate, mentorTimezone),
    forMentor: true,
    cancelLink: `${process.env.BASE_FRONT_URL}/cancel?token=${token}`,
    confirmationLink: `${process.env.BASE_FRONT_URL}/confirmation?token=${token}`,
  });
  await sendEmail(
    mentorEmail,
    `Hola ${mentorName}!`,
    htmlMentor,
    createICS(date, menteeName, {
      mentorshipId,
      menteeEmail,
      menteeName,
      mentorEmail,
      mentorName,
      timezone: mentorTimezone,
    })
  );
  return makeLambdaResponse<MentorshipResponse>(callback, {
    responseMessage: RESPONSE_CODES["0"],
    responseCode: "0",
    responseData: event.responseData,
  });
};

export default reminderMentorship;

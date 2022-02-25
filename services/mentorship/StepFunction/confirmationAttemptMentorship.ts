import { Handler } from "aws-lambda";
import { RESPONSE_CODES } from "../../../constants";
import { confirmMentorshipMail } from "../../../mails/confirmMentorship";
import { MentorshipResponse } from "../../../types";
import { toDateString, toTimeString } from "../../../utils/dates";
import { createICS } from "../../../utils/ical";
import { makeLambdaResponse } from "../../../utils/makeResponses";
import { sendEmail } from "../../../utils/sendEmail";

const confirmationAttemptMentorship: Handler = async (event, _, callback) => {
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
      mentorshipDate,
      token,
    },
  } = event;
  const date = new Date(mentorshipDate);

  try {
    const htmlMentee = confirmMentorshipMail({
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
    const htmlMentor = confirmMentorshipMail({
      mentorName,
      menteeName,
      date: toDateString(mentorshipDate, mentorTimezone),
      time: toTimeString(mentorshipDate, mentorTimezone),
      forMentor: true,
      cancelLink: `${process.env.BASE_FRONT_URL}/cancel?token=${token}`,
    });
    sendEmail(
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
  } catch (error) {
    return makeLambdaResponse<MentorshipResponse>(callback, {
      responseMessage: RESPONSE_CODES["-1"],
      responseCode: "-1",
      responseData: event.responseData,
    });
  }
};

export default confirmationAttemptMentorship;

import { Handler } from "aws-lambda";
import { RESPONSE_CODES } from "../../../constants";
import { MentorshipResponse } from "../../../types";
import { substractTime } from "../../../utils/dates";
import { makeLambdaResponse } from "../../../utils/makeResponses";

interface MentorshipRequestBody {
  mentorId: string;
  menteeId: string;
  menteeName: string;
  menteeEmail: string;
  menteeTimezone: string;
  mentorTimezone: string;
  mentorName: string;
  mentorEmail: string;
  mentorshipDate: Date;
  token: string;
}

const createMentorship: Handler<MentorshipRequestBody, MentorshipResponse> = (
  event,
  _,
  callback
) => {
  const {
    mentorId,
    menteeId,
    menteeName,
    menteeEmail,
    menteeTimezone,
    mentorTimezone,
    mentorName,
    mentorEmail,
    mentorshipDate,
    token,
  } = event;

  let dateToRemind = substractTime(new Date(mentorshipDate), 1, "days");

  return makeLambdaResponse<MentorshipResponse>(callback, {
    responseMessage: RESPONSE_CODES["100"],
    responseCode: "100",
    responseData: {
      mentorship: {
        mentorId,
        mentorEmail,
        mentorName,
        menteeId,
        menteeEmail,
        menteeName,
        menteeTimezone,
        mentorTimezone,
      },
      dateToRemind,
      mentorshipDate,
      token,
    },
  });
};

export default createMentorship;

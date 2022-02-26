import { APIGatewayProxyHandler } from "aws-lambda";
import { FILTERDATES } from "../../../constants";
import {
  getAllMentorships,
  getMentorshipsByMentorId,
} from "../../../repository/mentorship";
import { getTimeSlotById } from "../../../repository/timeSlot";
import { getUserByToken } from "../../../repository/user";
import { Mentorship } from "../../../types";
import { isFutureDate, isPastDate } from "../../../utils/dates";
import {
  makeErrorResponse,
  makeSuccessResponse,
} from "../../../utils/makeResponses";
import { isAdmin } from "../../../utils/validations";

const getMentorships: APIGatewayProxyHandler = async (event) => {
  const { pathParameters, queryStringParameters } = event;

  const id = pathParameters?.id;
  const filter = queryStringParameters?.filter;
  const filter_dates = queryStringParameters?.filter_dates;

  if (filter_dates === FILTERDATES.ALL) {
    const user_token = event.headers["user-token"];
    if (!user_token || (await getUserByToken(user_token)).Count === 0) {
      return makeErrorResponse(401, "-117");
    }
    if (!(await isAdmin(user_token))) {
      return makeErrorResponse(403, "-116");
    }
  }

  let data: Awaited<ReturnType<typeof getMentorshipsByMentorId>>;

  try {
    if (id) {
      data = await getMentorshipsByMentorId(id);
    } else {
      data = await getAllMentorships();
    }
  } catch (err) {
    return makeErrorResponse(400, "-107", err);
  }

  if (data.Items.length === 0) {
    return makeErrorResponse(404, "-108");
  }

  /* only filter when filter exists */
  const mentorshipsData = filter
    ? data.Items.filter((mt) => mt.mentorship_status === filter)
    : data.Items;

  const mentorshipsToReturn: Mentorship[] = [];

  for (const mentorship of mentorshipsData) {
    const timeSlotResult = await getTimeSlotById(mentorship.time_slot_id);

    if (!timeSlotResult || !timeSlotResult.Item) {
      return makeErrorResponse(500, "-103");
    }

    const timeSlot = timeSlotResult.Item;

    const date = new Date(timeSlotResult.Item.date);
    const checkDateFilter =
      (filter_dates === FILTERDATES.PAST && isPastDate(date)) ||
      (filter_dates === FILTERDATES.FUTURE && isFutureDate(date)) ||
      !filter_dates;

    if (!checkDateFilter) {
      continue;
    }

    delete mentorship?.feedback_mentee_private;
    delete mentorship?.time_slot_id;

    mentorship.time_slot_info = timeSlot;
    mentorshipsToReturn.push(mentorship);
  }

  return makeSuccessResponse(mentorshipsToReturn);
};

export default getMentorships;

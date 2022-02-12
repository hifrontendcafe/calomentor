import { APIGatewayProxyHandler, Context } from "aws-lambda";
import { isPast, isFuture } from "date-fns";
import {
  getAllMentorships,
  getMentorshipsByMentorId,
} from "../../repository/mentorship";
import { getTimeSlotById } from "../../repository/timeSlot";
import {
  makeErrorResponse,
  makeSuccessResponse,
} from "../../utils/makeResponses";
import { Mentorship } from "../../types";

import { FILTERDATES } from "../../constants";
import { isAdmin } from "../../utils/validations";
import { getUserByToken } from "../../repository/user";

const getMentorships: APIGatewayProxyHandler = async (event) => {
  const { pathParameters, queryStringParameters } = event;

  const id = pathParameters?.id;
  const filter = queryStringParameters?.filter;
  const filterDates = queryStringParameters?.filterDates;

  if (filterDates === FILTERDATES.ALL) {
    const userToken = event.headers["user-token"];
    if (!userToken || (await getUserByToken(userToken)).Count === 0) {
      return makeErrorResponse(401, "-117");
    }
    if (!(await isAdmin(userToken))) {
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
      (filterDates === FILTERDATES.PAST && isPast(date)) ||
      (filterDates === FILTERDATES.FUTURE && isFuture(date)) ||
      !filterDates;

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

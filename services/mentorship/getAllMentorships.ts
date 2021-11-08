import { Context } from "aws-lambda";
import { isPast, isFuture } from "date-fns";
import { getMentorshipsByMentorId } from "../../repository/mentorship";
import { getTimeSlotById } from "../../repository/timeSlot";
import {
  makeErrorResponse,
  makeSuccessResponse,
} from "../../utils/makeResponses";

import { RESPONSE_CODES, FILTERDATES } from "../../constants";

const getMentorships = async (event: any, _context: Context) => {
  const { pathParameters, queryStringParameters } = event;

  const { id } = pathParameters;
  const filter = queryStringParameters?.filter;
  const filterDates = queryStringParameters?.filterDates;

  let data;

  try {
    data = await getMentorshipsByMentorId(id);
  } catch (err) {
    return makeErrorResponse(400, RESPONSE_CODES["-107"], err);
  }

  if (data.Items.length === 0) {
    return makeErrorResponse(404, RESPONSE_CODES["-108"]);
  }

  /* only filter when filter exists */
  const mentorshipsData = filter
    ? data.Items.filter((mt) => mt.mentorship_status === filter)
    : data.Items;

  const mentorshipsToReturn = [];

  for (const mentorship of mentorshipsData) {
    const timeSlotInfo = await getTimeSlotById(mentorship.time_slot_id);

    if (!timeSlotInfo || !timeSlotInfo.Item) {
      throw new Error(RESPONSE_CODES["-103"]);
    }

    const date = new Date(timeSlotInfo.Item.date);
    const checkDateFilter =
      (filterDates === FILTERDATES.PAST && isPast(date)) ||
      (filterDates === FILTERDATES.FUTURE && isFuture(date)) ||
      !filterDates;

    if (!checkDateFilter) {
      continue;
    }

    delete mentorship?.feedback_mentee_private;
    delete mentorship?.time_slot_id;

    mentorship.time_slot_info = timeSlotInfo?.Item;
    mentorshipsToReturn.push(mentorship);
  }

  return makeSuccessResponse({ data: mentorshipsToReturn });
  //TODO: Validate admin
};

export default getMentorships;

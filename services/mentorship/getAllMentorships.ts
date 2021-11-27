import { Context } from "aws-lambda";
import { isPast, isFuture } from "date-fns";
import { getMentorshipsByMentorId } from "../../repository/mentorship";
import { getTimeSlotById } from "../../repository/timeSlot";
import {
  makeErrorResponse,
  makeSuccessResponse,
} from "../../utils/makeResponses";
import { Mentorship } from "../../types";

import { FILTERDATES } from "../../constants";

const getMentorships = async (event: any, _context: Context) => {
  const { pathParameters, queryStringParameters } = event;

  const { id } = pathParameters;
  const filter = queryStringParameters?.filter;
  const filterDates = queryStringParameters?.filterDates;

  let data: Awaited<ReturnType<typeof getMentorshipsByMentorId>>;

  try {
    data = await getMentorshipsByMentorId(id);
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
  //TODO: Validate admin
};

export default getMentorships;

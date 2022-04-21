import { APIGatewayProxyHandler } from "aws-lambda";
import { FILTERDATES, STATUS } from "../../../constants";
import {
  getAllMentorships,
  getMentorshipsByUserId,
  getMentorshipsByName,
} from "../../../repository/mentorship";
import { getTimeSlotById } from "../../../repository/timeSlot";
import { getUserByToken } from "../../../repository/user";
import { Mentorship, TimeSlot } from "../../../types";
import { isFutureDate, isPastDate } from "../../../utils/dates";
import {
  makeErrorResponse,
  makeSuccessResponse,
} from "../../../utils/makeResponses";

const getMentorships: APIGatewayProxyHandler = async (event) => {
  const { pathParameters, queryStringParameters } = event;

  const id = pathParameters?.id;
  const filter = queryStringParameters?.filter;
  const filter_dates = queryStringParameters?.filter_dates ?? FILTERDATES.ALL;
  const name = queryStringParameters?.name;
  const lastKey = queryStringParameters?.last_key;
  const limit = queryStringParameters?.limit;

  // if (filter_dates === FILTERDATES.ALL) {
  //   const user_token = event.headers["user-token"];
  //   if (!user_token || (await getUserByToken(user_token)).Count === 0) {
  //     return makeErrorResponse(401, "-117");
  //   }
  //   if (!(await isAdmin(user_token))) {
  //     return makeErrorResponse(403, "-116");
  //   }
  // }

  let data: Awaited<ReturnType<typeof getAllMentorships>>;

  try {
    if (!id && !name) {
      data = await getAllMentorships(lastKey, limit);
    }

    // ID can be mentor or mentee discord id
    if (id) {
      data = await getMentorshipsByUserId(id, lastKey, limit);
    }

    // NAME can be mentor or mentee discord username or real name
    if (name) {
      data = await getMentorshipsByName(name, lastKey, limit);
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
    let timeSlotResult: Awaited<ReturnType<typeof getTimeSlotById>>;

    if (mentorship.time_slot_id) {
      timeSlotResult = await getTimeSlotById(mentorship.time_slot_id);
    }

    let timeSlot: TimeSlot | null = null;
    let date: Date;

    if (timeSlotResult && timeSlotResult.Item) {
      timeSlot = timeSlotResult.Item;
      date = new Date(timeSlotResult.Item.date);
    }

    mentorship.time_slot_info = timeSlot;

    if (date) {
      /**
       * When filter_dates is "PAST" we need to show:
       * - Past mentorships
       * - Canceled mentorships
       */
      if (filter_dates === FILTERDATES.PAST) {
        if (
          isPastDate(date) ||
          mentorship.mentorship_status === STATUS.CANCEL
        ) {
          mentorshipsToReturn.push(mentorship);
        }
      }

      /**
       * When filter_dates is "FUTURE" we need to show:
       * - Future mentorships that aren't canceled
       */
      if (filter_dates === FILTERDATES.FUTURE) {
        if (
          isFutureDate(date) &&
          mentorship.mentorship_status !== STATUS.CANCEL &&
          mentorship.mentorship_status !== STATUS.WITHWARNING
        ) {
          mentorshipsToReturn.push(mentorship);
        }
      }
    }

    if (filter_dates === FILTERDATES.ALL) {
      mentorshipsToReturn.push(mentorship);
    }
  }

  return makeSuccessResponse(mentorshipsToReturn, "1", data.Count, data.LastEvaluatedKey);
};

export default getMentorships;

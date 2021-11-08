import { Context } from "aws-lambda";
import { isPast } from "date-fns";
import { scan, get } from "../../utils/dynamoDb";

import {
  RESPONSE_CODES,
  TABLE_NAME_MENTORSHIP,
  TABLE_NAME_TIME_SLOT,
  FILTERDATES,
} from "../../constants";

const getMentorships = async (event: any, _context: Context) => {
  const { pathParameters, queryStringParameters } = event;

  const { id } = pathParameters;
  const filter = queryStringParameters?.filter;
  const filterDates = queryStringParameters?.filterDates;

  const paramsWithUserId = {
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression: "mentor_id = :mentor_id",
    ExpressionAttributeValues: {
      ":mentor_id": id,
    },
  };

  let data;

  try {
    data = await scan(paramsWithUserId);
  } catch (err) {
    const body = JSON.stringify({
      message: RESPONSE_CODES["-107"],
      data: {
        error: err,
      },
    });

    return {
      statusCode: 400,
      body,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  }

  if (data.Items.length === 0) {
    const responseCode = "-108";

    const body = JSON.stringify({
      message: RESPONSE_CODES[responseCode],
      data: {
        responseMessage: RESPONSE_CODES[responseCode],
        responseCode,
      },
    });

    return {
      statusCode: 404,
      body,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  }

  /* only filter when filter exists */
  const mentorshipsData = filter
    ? data.Items.filter((mt) => mt.mentorship_status === filter)
    : data.Items;

  const responseData = await Promise.all(
    mentorshipsData.map(async (ment) => {
      const timeSlotInfo = await get({
        TableName: TABLE_NAME_TIME_SLOT,
        Key: { id: ment.time_slot_id },
      });

      if (!timeSlotInfo) {
        return ment;
      }

      let mentorshipInfo = ment;

      if (
        filterDates === FILTERDATES.PAST &&
        isPast(new Date(timeSlotInfo.Item?.date))
      ) {
        ment.time_slot_info = timeSlotInfo?.Item;
        mentorshipInfo = ment;
      } else if (
        filterDates === FILTERDATES.FUTURE &&
        !isPast(new Date(timeSlotInfo.Item?.date))
      ) {
        ment.time_slot_info = timeSlotInfo?.Item;
        mentorshipInfo = ment;
      } else if (!filterDates) {
        ment.time_slot_info = timeSlotInfo?.Item;
        mentorshipInfo = ment;
      }

      delete mentorshipInfo?.time_slot_id;
      delete mentorshipInfo?.feedback_mentee_private;
      delete mentorshipInfo?.time_slot_info?.user_id;
      delete mentorshipInfo?.time_slot_info?.tokenForCancel;
      delete mentorshipInfo?.time_slot_info?.mentee_id;
      delete mentorshipInfo?.time_slot_info?.mentee_username;

      return mentorshipInfo;
    })
  );

  const responseCode = "0";

  const body = JSON.stringify({
    message: RESPONSE_CODES[responseCode],
    data: responseData.filter((m) => m),
  });

  return {
    statusCode: 200,
    body,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  //TODO: Validate admin
};

export default getMentorships;

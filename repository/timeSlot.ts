import { TABLE_NAME_TIME_SLOT } from "../constants";
import { get, put, scan, ScanInput } from "../utils/dynamoDb";
import { TimeSlot } from "../types";
import { toInt } from "../utils/toInt";

export function getTimeSlotById(id: number) {
  return get<TimeSlot>({
    TableName: TABLE_NAME_TIME_SLOT,
    Key: { id },
  });
}

interface TimeSlotFilters {
  slotDate?: string;
  onlyFree?: boolean;
}

export function getTimeSlotsByUserId(
  userId: number,
  filters: TimeSlotFilters = {}
) {
  const query: ScanInput = {
    TableName: TABLE_NAME_TIME_SLOT,
    FilterExpression: "#user = :user_id",
    ExpressionAttributeNames: {
      "#user": "user_id",
    },
    ExpressionAttributeValues: {
      ":user_id": userId,
    },
  };

  if (filters.slotDate) {
    query.FilterExpression = `${query.FilterExpression} and #date = :slot_date`;
    query.ExpressionAttributeNames["#date"] = "date";
    query.ExpressionAttributeValues[":slot_date"] = toInt(filters.slotDate);
  }

  if (filters.onlyFree) {
    query.FilterExpression = `${query.FilterExpression} and #occupied = :is_occupied`;
    query.ExpressionAttributeNames["#occupied"] = "is_occupied";
    query.ExpressionAttributeValues[":is_occupied"] = false;
  }

  return scan<TimeSlot[]>(query);
}

export function createTimeSlot(timeSlotInfo: TimeSlot) {
  return put<TimeSlot>({
    TableName: TABLE_NAME_TIME_SLOT,
    Item: timeSlotInfo,
  });
}

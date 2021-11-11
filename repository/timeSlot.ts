import { TABLE_NAME_TIME_SLOT } from "../constants";
import { get, put } from "../utils/dynamoDb";
import { TimeSlot } from "../types";

export function getTimeSlotById(id) {
  return get<TimeSlot>({
    TableName: TABLE_NAME_TIME_SLOT,
    Key: { id },
  });
}

export function createTimeSlot(timeSlotInfo: TimeSlot) {
  return put<TimeSlot>({
    TableName: TABLE_NAME_TIME_SLOT,
    Item: timeSlotInfo,
  });
}

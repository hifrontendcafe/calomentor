import { TABLE_NAME_TIME_SLOT } from "../constants";

import { get, put, scan, update, deleteItem } from "../utils/dynamoDb";

import type { TimeSlot } from "../types";
import { toInt } from "../utils/toInt";

export function getTimeSlotById(id: string) {
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
  userId: string,
  filters: TimeSlotFilters = {}
) {
  const query: Parameters<typeof scan>[0] = {
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

  return scan<TimeSlot>(query);
}

export function createTimeSlot(timeSlotInfo: TimeSlot) {
  return put<TimeSlot>({
    TableName: TABLE_NAME_TIME_SLOT,
    Item: timeSlotInfo,
  });
}

interface UpdateIsOccupiedParams {
  type: "CHANGE_OCCUPIED_STATE";
  isOccupied: boolean;
}

interface Mentee {
  id: string;
  username: string;
  tokenForCancel: string;
}

interface UpdateMenteeParams {
  type: "ADD_MENTEE" | "REMOVE_MENTEE";
  mentee?: Mentee;
}

type UpdateParams = UpdateIsOccupiedParams | UpdateMenteeParams;

function updateTimeSlot(id: string, payload: UpdateParams) {
  const params: Parameters<typeof update>[0] = {
    TableName: TABLE_NAME_TIME_SLOT,
    Key: { id },
    ReturnValues: "ALL_NEW",
  };

  switch (payload.type) {
    case "CHANGE_OCCUPIED_STATE":
      params.ExpressionAttributeValues = {
        ":is_occupied": payload.isOccupied,
      };
      params.UpdateExpression = "SET is_occupied = :is_occupied";

      break;

    case "ADD_MENTEE":
      params.ExpressionAttributeValues = {
        ":mentee_id": payload.mentee.id,
        ":mentee_username": payload.mentee.username,
        ":tokenForCancel": payload.mentee.tokenForCancel,
      };

      params.UpdateExpression = `SET mentee_id = :mentee_id,
             mentee_username = :mentee_username,
             tokenForCancel = :tokenForCancel`;
      break;

    case "REMOVE_MENTEE":
      params.ExpressionAttributeValues = {
        ":mentee_id": "",
        ":mentee_username": "",
        ":tokenForCancel": "",
      };

      params.UpdateExpression = `SET mentee_id = :mentee_id,
               mentee_username = :mentee_username,
               tokenForCancel = :tokenForCancel`;
      break;

    default:
      throw new Error("Invalid update operation");
  }

  return update<TimeSlot>(params);
}

export function deleteTimeSlot(id: string) {
  return deleteItem<TimeSlot>({
    TableName: TABLE_NAME_TIME_SLOT,
    Key: { id },
    ReturnValues: "ALL_OLD",
  });
}

export function fillTimeSlot(id: string) {
  return updateTimeSlot(id, {
    type: "CHANGE_OCCUPIED_STATE",
    isOccupied: true,
  });
}

export function freeTimeSlot(id: string) {
  return updateTimeSlot(id, {
    type: "CHANGE_OCCUPIED_STATE",
    isOccupied: false,
  });
}

export function addMenteeToTimeSlot(id: string, mentee: Mentee) {
  return updateTimeSlot(id, { type: "ADD_MENTEE", mentee });
}

export function removeMenteeFromTimeSlot(id: string) {
  return updateTimeSlot(id, { type: "REMOVE_MENTEE" });
}

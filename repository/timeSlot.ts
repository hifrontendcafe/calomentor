import { TABLE_NAME_TIME_SLOT, TABLE_NAME_TIME_SLOT_DEV, TIMESLOT_STATUS } from "../constants";
import { TimeSlot } from "../types";
import { deleteItem, get, put, scan, update } from "../utils/dynamoDb";
import { toInt } from "../utils/toInt";

const TableName = process.env.STAGE === "dev" ? TABLE_NAME_TIME_SLOT_DEV : TABLE_NAME_TIME_SLOT

export function getTimeSlotById(id: string) {
  return get<TimeSlot>({
    TableName,
    Key: { id },
  });
}

interface TimeSlotFilters {
  slotDate?: string;
  onlyFree?: boolean;
  onlyFuture?: boolean;
  getAll?: boolean
}

export function getTimeSlotsByUserId(
  userId: string,
  filters: TimeSlotFilters = {}
) {
  const query: Parameters<typeof scan>[0] = {
    TableName,
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

  if (filters.onlyFree && !filters.getAll) {
    query.FilterExpression = `${query.FilterExpression} and #occupied = :timeslot_status`;
    query.ExpressionAttributeNames["#occupied"] = "timeslot_status";
    query.ExpressionAttributeValues[":timeslot_status"] = TIMESLOT_STATUS.FREE;
  }

  if (!filters.onlyFree && !filters.getAll) {
    query.FilterExpression = `${query.FilterExpression} and #occupied <> :timeslot_status`;
    query.ExpressionAttributeNames["#occupied"] = "timeslot_status";
    query.ExpressionAttributeValues[":timeslot_status"] = TIMESLOT_STATUS.CANCELED_BY_MENTOR;
  }

  if (filters.onlyFuture) {
    query.FilterExpression = `${query.FilterExpression} and #date >= :today`;
    query.ExpressionAttributeNames["#date"] = "date";
    query.ExpressionAttributeValues[":today"] = Date.now();
  }

  return scan<TimeSlot>(query);
}

export function createTimeSlot(timeSlotInfo: TimeSlot) {
  return put<TimeSlot>({
    TableName,
    Item: timeSlotInfo,
  });
}

interface UpdateIsOccupiedParams {
  type: "CHANGE_TIMESLOT_STATUS";
  timeslot_status: TIMESLOT_STATUS;
}

interface Mentee {
  id: string;
  username: string;
  mentorship_token: string;
}

interface UpdateMenteeParams {
  type: "ADD_MENTEE" | "REMOVE_MENTEE";
  mentee?: Mentee;
}

type UpdateParams = UpdateIsOccupiedParams | UpdateMenteeParams;

function updateTimeSlot(id: string, payload: UpdateParams) {
  const params: Parameters<typeof update>[0] = {
    TableName,
    Key: { id },
    ReturnValues: "ALL_NEW",
  };

  switch (payload.type) {
    case "CHANGE_TIMESLOT_STATUS":
      params.ExpressionAttributeValues = {
        ":timeslot_status": payload.timeslot_status,
      };
      params.UpdateExpression = `SET timeslot_status = :timeslot_status`;
      break;

    case "ADD_MENTEE":
      params.ExpressionAttributeValues = {
        ":mentee_id": payload.mentee.id,
        ":mentee_username": payload.mentee.username,
        ":mentorship_token": payload.mentee.mentorship_token,
      };

      params.UpdateExpression = `SET mentee_id = :mentee_id,
             mentee_username = :mentee_username,
             mentorship_token = :mentorship_token`;
      break;

    case "REMOVE_MENTEE":
      params.ExpressionAttributeValues = {
        ":mentee_id": "",
        ":mentee_username": "",
        ":mentorship_token": "",
      };

      params.UpdateExpression = `SET mentee_id = :mentee_id,
               mentee_username = :mentee_username,
               mentorship_token = :mentorship_token`;
      break;

    default:
      throw new Error("Invalid update operation");
  }

  return update<TimeSlot>(params);
}

export function deleteTimeSlot(id: string) {
  return deleteItem<TimeSlot>({
    TableName,
    Key: { id },
    ReturnValues: "ALL_OLD",
  });
}

export function updateTimeslotStatus(
  id: string,
  timeslot_status: TIMESLOT_STATUS
) {
  return updateTimeSlot(id, {
    type: "CHANGE_TIMESLOT_STATUS",
    timeslot_status,
  });
}

export function addMenteeToTimeSlot(id: string, mentee: Mentee) {
  return updateTimeSlot(id, { type: "ADD_MENTEE", mentee });
}

export function removeMenteeFromTimeSlot(id: string) {
  return updateTimeSlot(id, { type: "REMOVE_MENTEE" });
}

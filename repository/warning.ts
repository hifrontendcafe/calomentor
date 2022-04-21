import { TABLE_NAME_WARNINGS, WARNSTATE } from "../constants";
import { Warning } from "../types";
import { generateUpdateQuery, put, scan, update } from "../utils/dynamoDb";

export function addWarning(warning: Warning) {
  return put<Warning>({
    TableName: TABLE_NAME_WARNINGS,
    Item: warning,
  });
}

export function getWarningsData(
  filter: {
    id?: string;
    allWarnings?: boolean;
    name?: string;
  },
  lastKey?: string,
  limit?: string
) {
  const { id, allWarnings, name } = filter;

  let query: Parameters<typeof scan>[0] = {
    TableName: TABLE_NAME_WARNINGS,
  };

  if (lastKey) {
    query.ExclusiveStartKey = { id: lastKey };
  }

  if(limit) { 
    query.Limit = Number.parseInt(limit)
  }

  if (id) {
    query.FilterExpression = "mentee_id = :mentee_id";
    query.ExpressionAttributeValues = {
      ":mentee_id": id,
    };
    if (!allWarnings) {
      query.FilterExpression = `${query.FilterExpression} and warning_status = :warning_status`;
      query.ExpressionAttributeValues[":warning_status"] = WARNSTATE.ACTIVE;
    }
  } else if (name) {
    query.FilterExpression = `
      contains(searcheable_warning_author_name, :name) OR 
      contains(searcheable_warning_author_username_discord, :name) OR 
      contains(searcheable_mentee_name, :name) OR 
      contains(searcheable_mentee_username_discord, :name) OR 
      contains(searcheable_mentor_name, :name) OR 
      contains(searcheable_mentor_username_discord, :name) OR 
      contains(searcheable_forgive_author_name, :name) OR 
      contains(searcheable_forgive_author_username_discord, :name)`;
    query.ExpressionAttributeValues = {
      ":name": name.toLowerCase(),
    };
  } else {
    query.ProjectionExpression =
      "id, mentee_id, warn_type, warn_cause, mentorship_id, warning_date, forgive_cause, mentor_name, mentee_name, warning_status, warning_author_id, warning_author_name, forgive_author_username_discord, forgive_author_name, forgive_author_id";
  }

  return scan<Warning>(query);
}

export function updateWarning(
  id: string,
  data: Partial<Warning>,
  allowedToUpdate: (keyof Warning)[] = null
) {
  let updateExpression: ReturnType<typeof generateUpdateQuery>;
  try {
    updateExpression = generateUpdateQuery<Partial<Warning>>(
      data,
      allowedToUpdate
    );
  } catch (err) {
    throw err;
  }

  return update<Warning>({
    TableName: TABLE_NAME_WARNINGS,
    Key: { id },
    ConditionExpression: "attribute_exists(id)",
    ReturnValues: "ALL_NEW",
    ...updateExpression,
  });
}

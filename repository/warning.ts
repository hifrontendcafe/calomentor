import { TABLE_NAME_WARNINGS, TABLE_NAME_WARNINGS_DEV, WARNSTATE } from "../constants";
import { Warning } from "../types";
import { deleteItem, generateUpdateQuery, put, scan, update } from "../utils/dynamoDb";

const TableName = process.env.STAGE === "dev" ? TABLE_NAME_WARNINGS_DEV : TABLE_NAME_WARNINGS

export function addWarning(warning: Warning) {
  return put<Warning>({
    TableName,
    Item: warning,
  });
}

export function getWarningsData(
  filter: {
    id?: string;
    allWarnings?: boolean;
    name?: string;
  },
  lastKeyId?: string,
  limit?: string,
) {
  const { id, allWarnings, name } = filter;

  let query: Parameters<typeof scan>[0] = {
    TableName,
    Select: "ALL_ATTRIBUTES"
  };

  if (lastKeyId) {
    query.ExclusiveStartKey = { id: lastKeyId  };
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
    TableName,
    Key: { id },
    ConditionExpression: "attribute_exists(id)",
    ReturnValues: "ALL_NEW",
    ...updateExpression,
  });
}

export function deleteWarning(id: string) {
  return deleteItem<Warning>({
    TableName,
    Key: { id },
    ReturnValues: "ALL_OLD",
  });
}
import { TABLE_NAME_MENTORSHIP } from "../constants";
import { scan, ScanResult } from "../utils/dynamoDb";
import { Mentorship } from "../types";
import type { PromiseResult } from "aws-sdk/lib/request";
import type { AWSError } from "aws-sdk";

export function getMentorshipsByMentorId(id) {
  return scan<Mentorship>({
    TableName: TABLE_NAME_MENTORSHIP,
    FilterExpression: "mentor_id = :mentor_id",
    ExpressionAttributeValues: { ":mentor_id": id },
  }) as Promise<PromiseResult<ScanResult<Mentorship>, AWSError>>;
}

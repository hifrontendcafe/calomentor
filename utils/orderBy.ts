import { Mentorship, Warning } from "../types";

export const orderMentorshipsByDate = (
  array: Mentorship[],
  limit: number
): Mentorship[] => {
  return array
    .sort(
      (a, b) =>
        Number.parseInt(b?.mentorship_create_date!) -
        Number.parseInt(a?.mentorship_create_date!)
    )
    .slice(0, limit);
};

export const orderWarningsByDate = (
  array: Warning[],
  limit: number
): Warning[] => {
  return array
    .sort((a, b) => b?.warning_date - a?.warning_date)
    .slice(0, limit);
};

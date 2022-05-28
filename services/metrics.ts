import { APIGatewayProxyHandler } from "aws-lambda/trigger/api-gateway-proxy";
import dayjs from "dayjs";
import {
  getAllMentorships,
  getMentorshipBetweenTwoDates,
} from "../repository/mentorship";
import { getMentors } from "../repository/user";
import {
  getWarningBetweenTwoDates,
  getWarningsData,
} from "../repository/warning";
import {
  getFirstDayOfMonth,
  getFirstDayOfWeek,
  getFirstDayOfYear,
  getLastDayOfMonth,
  getLastDayOfYear,
  substractTime,
} from "../utils/dates";
import { makeErrorResponse, makeSuccessResponse } from "../utils/makeResponses";

export const getMetrics: APIGatewayProxyHandler = async (event) => {
  // Get dates for search metrics

  const today = new Date();
  const firstDayOfTheYear = getFirstDayOfYear(today.getTime());
  const firstDayOfTheMonth = getFirstDayOfMonth(today.getTime());
  const firstDayOfTheWeek = getFirstDayOfWeek(today.getTime());
  const todayMinusTwentyFourHours = String(
    substractTime(today, 24, "hours").getTime()
  );
  const firstDayOfTheLastYear = getFirstDayOfYear(
    substractTime(today, 1, "year").getTime()
  );
  const firstDayOfTheLastMonth = getFirstDayOfMonth(
    substractTime(today, 1, "month").getTime()
  );
  const lastDayOfTheLastYear = getLastDayOfYear(today.getTime());
  const lastDayOfTheLastMonth = getLastDayOfMonth(today.getTime());

  try {
    // Get Mentors metrics

    const mentors = await getMentors();
    const activeMentors = mentors?.filter((mentor) => mentor.isActive);

    // Get Mentorships metrics

    const mentorshipsOfTheYear = await getMentorshipBetweenTwoDates(
      firstDayOfTheYear,
      String(today.getTime())
    );
    const mentorshipsOfTheMonth = await getMentorshipBetweenTwoDates(
      firstDayOfTheMonth,
      String(today.getTime())
    );
    const mentorshipsOfTheWeek = await getMentorshipBetweenTwoDates(
      firstDayOfTheWeek,
      String(today.getTime())
    );
    const mentorshipsOfTheDay = await getMentorshipBetweenTwoDates(
      String(todayMinusTwentyFourHours),
      String(today.getTime())
    );
    const mentorshipsOfTheLastMonth = await getMentorshipBetweenTwoDates(
      String(firstDayOfTheLastMonth),
      String(lastDayOfTheLastMonth)
    );
    const mentorshipsOfTheLastYear = await getMentorshipBetweenTwoDates(
      String(firstDayOfTheLastYear),
      String(lastDayOfTheLastYear)
    );

    const allMentorships = await getAllMentorships();

    // Get Warnings metrics

    const warningsOfTheYear = await getWarningBetweenTwoDates(
      firstDayOfTheYear,
      String(today.getTime())
    );
    const warningsOfTheMonth = await getWarningBetweenTwoDates(
      firstDayOfTheMonth,
      String(today.getTime())
    );
    const warningsOfTheWeek = await getWarningBetweenTwoDates(
      firstDayOfTheWeek,
      String(today.getTime())
    );
    const warningsOfTheDay = await getWarningBetweenTwoDates(
      String(todayMinusTwentyFourHours),
      String(today.getTime())
    );
    const warningsOfTheLastMonth = await getWarningBetweenTwoDates(
      String(firstDayOfTheLastMonth),
      String(lastDayOfTheLastMonth)
    );
    const warningsOfTheLastYear = await getWarningBetweenTwoDates(
      String(firstDayOfTheLastYear),
      String(lastDayOfTheLastYear)
    );

    const allWarnings = await getWarningsData({ allWarnings: true });

    return makeSuccessResponse(
      {
        mentorships_metrics: {
          mentorshipsOfTheYear: mentorshipsOfTheYear.Count,
          mentorshipsOfTheLastYear: mentorshipsOfTheLastYear.Count,
          mentorshipsOfTheMonth: mentorshipsOfTheMonth.Count,
          mentorshipsOfTheLastMonth: mentorshipsOfTheLastMonth.Count,
          mentorshipsOfTheWeek: mentorshipsOfTheWeek.Count,
          mentorshipsOfTheDay: mentorshipsOfTheDay.Count,
          mentorshipsOfTheCurrentMonthOverLastMonth:
            mentorshipsOfTheMonth.Count / mentorshipsOfTheLastMonth.Count,
          mentorshipsOfTheCurrentYearOverLastYear:
            mentorshipsOfTheYear.Count / mentorshipsOfTheLastYear.Count,
          mentorshipsTotal: allMentorships.Count,
          mentorshipsTotalOverActiveMentorsOfTheMonth:
            mentorshipsOfTheYear.Count / activeMentors.length,
          mentorshipsTotalOverActiveMentorsOfTheYear:
            mentorshipsOfTheMonth.Count / activeMentors.length,
          all_mentorships: allMentorships.Items,
        },
        warnings_metrics: {
          warningsOfTheYear: warningsOfTheYear.Count,
          warningsOfTheLastYear: warningsOfTheLastYear.Count,
          warningsOfTheMonth: warningsOfTheMonth.Count,
          warningsOfTheLastMonth: warningsOfTheLastMonth.Count,
          warningsOfTheWeek: warningsOfTheWeek.Count,
          warningsOfTheDay: warningsOfTheDay.Count,
          warningsOfTheCurrentMonthOverLastMonth:
            warningsOfTheMonth.Count / warningsOfTheLastMonth.Count,
          warningsOfTheCurrentYearOverLastYear:
            warningsOfTheYear.Count / warningsOfTheLastYear.Count,
          warningsTotal: warningsOfTheYear.ScannedCount,
          warningsOverMentorshipsOfTheWeek:
            warningsOfTheWeek.Count / mentorshipsOfTheWeek.Count,
          warningsOverMentorshipsOfTheMonth:
            warningsOfTheMonth.Count / mentorshipsOfTheMonth.Count,
          warningsOverMentorshipsOfTheYear:
            warningsOfTheYear.Count / mentorshipsOfTheYear.Count,
          all_warnings: allWarnings.Items,
        },
        mentors: {
          total: mentors?.length,
          active: activeMentors?.length,
        },
        dates: {
          today,
          firstDayOfTheYear,
          firstDayOfTheMonth,
          firstDayOfTheWeek,
          todayMinusTwentyFourHours,
          firstDayOfTheLastYear,
          firstDayOfTheLastMonth,
          lastDayOfTheLastYear,
          lastDayOfTheLastMonth,
        },
      },
      "999"
    );
  } catch (error) {
    return makeErrorResponse(400, "-999", error?.stack);
  }
};

export const getMentorshipsMetricsBetweenTwoDates: APIGatewayProxyHandler =
  async (event) => {
    const { dateOne, dateTwo } = event.queryStringParameters;

    const today = String(Date.now());

    try {
      const mentorships = await getMentorshipBetweenTwoDates(
        dateOne,
        dateTwo || today
      );
      const warnings = await getWarningBetweenTwoDates(dateOne, dateTwo || today);
      return makeSuccessResponse(
        {
          // all_mentorships: mentorships.Items,
          mentorships_count: mentorships.Count,
          warnings_count: warnings.Count,
        },
        "999"
      );
    } catch (error) {
      return makeErrorResponse(400, "-999", error?.stack);
    }
  };

export const getWarningsMetricsBetweenTwoDates: APIGatewayProxyHandler = async (
  event
) => {
  const { dateOne, dateTwo } = event.queryStringParameters;

  const today = String(Date.now());
  try {
    const warnings = await getWarningBetweenTwoDates(dateOne, dateTwo || today);
    return makeSuccessResponse(
      {
        all_warnings: warnings.Items,
        warnings_count: warnings.Count,
      },
      "999"
    );
  } catch (error) {
    return makeErrorResponse(400, "-999", error?.stack);
  }
};

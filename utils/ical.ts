import ical from "ical-generator";
import { addTime } from "./dates";

interface IcalData {
  mentorName: string;
  menteeName: string;
  mentorEmail: string;
  menteeEmail: string;
  timezone: string;
}

export function createICS(
  date: Date,
  mentorshipWith: string,
  data: IcalData
): string {
  const calendar = ical();
  calendar.createEvent({
    attendees: [
      {
        name: data.mentorName,
        email: data.mentorEmail,
      },
      {
        name: data.menteeName,
        email: data.mentorEmail,
      },
    ],
    organizer: {
      name: "FrontendCafé",
      email: "frontendcafe@gmail.com",
    },
    priority: 1,
    timezone: data.timezone,
    start: date,
    end: addTime(date, 1, "hours"),
    summary: `Mentoría con ${mentorshipWith}`,
    description: `Mentoría con ${mentorshipWith}`,
    location: "FrontendCafé Discord",
    url: "https://discord.com/channels/594363964499165194/897162165272842240",
  });

  return calendar.toString();
}

import { zonedTimeToUtc } from "date-fns-tz";

const timeZone: string = "America/Montevideo";
const locale: string = "es-AR";

export const toDateString: (date: Date) => string = (date) => {
  return zonedTimeToUtc(date, timeZone).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const toTimeString: (date: Date) => string = (date) => {
  return zonedTimeToUtc(date, timeZone).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

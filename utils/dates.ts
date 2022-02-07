import { zonedTimeToUtc } from "date-fns-tz";
import { formatDistanceToNow } from "date-fns";
import { es } from 'date-fns/locale'

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

export const distanceFromNow: (date: Date) => string = (date) => {
  return formatDistanceToNow(zonedTimeToUtc(date, timeZone), { locale: es });
};

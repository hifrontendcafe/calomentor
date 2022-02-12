import { zonedTimeToUtc } from "date-fns-tz";
import * as dayjs from 'dayjs'

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

export const isPastDate = (date: Date, dateToCompare?: Date): boolean => {
  return dayjs(dateToCompare).isAfter(dayjs(date))
};

export const isSameDate = (dateOne: Date, dateTwo: Date): boolean => {
  return dayjs(dateOne).isSame(dayjs(dateTwo))
};

export const addTime = (date: Date, timeToAdd: number, unit: dayjs.UnitType): Date => {
  return dayjs(date).add(timeToAdd, unit).toDate()
};
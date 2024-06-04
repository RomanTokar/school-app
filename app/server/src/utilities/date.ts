import {
  getHours,
  getMilliseconds,
  getMinutes,
  getSeconds,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from 'date-fns';

export const overlapHoursMinutesSecondsMilliseconds = (
  firstDate: Date,
  secondDate: Date,
): Date => {
  const hours = getHours(secondDate);
  const minutes = getMinutes(secondDate);
  const seconds = getSeconds(secondDate);
  const milliseconds = getMilliseconds(secondDate);
  let date = setHours(firstDate, hours);
  date = setMinutes(date, minutes);
  date = setSeconds(date, seconds);
  date = setMilliseconds(date, milliseconds);
  return date;
};

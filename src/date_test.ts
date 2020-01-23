import { DateTime } from 'luxon';

const dateString = '2020-01-23T18:31:06Z';
const dateString2 = '2020-01-23T23:31:06Z';

const parsedDateString = DateTime.fromISO(dateString);
const parsedDateString2 = DateTime.fromISO(dateString2);

const res = parsedDateString.diff(parsedDateString2, 'hour');
console.log(Math.abs(res.hours));

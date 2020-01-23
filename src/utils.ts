import { DynamoDbPersistenceAdapter } from 'ask-sdk-dynamodb-persistence-adapter';
import { DateTime } from 'luxon';

// in hours
const VALID_STREAM_DURATION = 5;

export function getPersistenceAdapter(tableName: string): DynamoDbPersistenceAdapter {
  return new DynamoDbPersistenceAdapter({
    tableName: tableName,
    createTable: true,
  });
}

export function checkStreamTimeValid(streamTimestamp: string, requestTimestamp: string): boolean {
  if (!streamTimestamp || !requestTimestamp) return false;
  const parsedStreamTimestamp = DateTime.fromISO(streamTimestamp);
  const parsedRequestTimestamp = DateTime.fromISO(requestTimestamp);
  const hourDiff = parsedRequestTimestamp.diff(parsedStreamTimestamp, 'hours');
  return Math.abs(hourDiff.hours) < VALID_STREAM_DURATION;
}

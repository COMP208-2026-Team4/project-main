let sequence = 0n;
let lastTimestamp = 0n;

export function generateSnowflake(): string {
  let now = BigInt(Date.now());

  if (now === lastTimestamp) {
    sequence = (sequence + 1n) & 0xFFFn;
    if (sequence === 0n) now++; // wait next ms on overflow
  } else {
    sequence = 0n;
  }

  lastTimestamp = now;
  return ((now << 12n) | sequence).toString();
}

export function getTimestampFromSnowflake(snowflake: string): Date {
  const timestamp = BigInt(snowflake) >> 12n;
  return new Date(Number(timestamp));
}

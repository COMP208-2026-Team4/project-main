// Simple Snowflake-like ID generator (matches sessions-api pattern)
const EPOCH = 1_700_000_000_000n; // Nov 2023 epoch
let sequence = 0n;

export function generateSnowflake(): string {
  const now = BigInt(Date.now()) - EPOCH;
  const id = (now << 22n) | (sequence & 0xfffn);
  sequence = (sequence + 1n) & 0xfffn;
  return id.toString();
}

export function getTimestampFromSnowflake(id: string): Date {
  const ms = (BigInt(id) >> 22n) + EPOCH;
  return new Date(Number(ms));
}

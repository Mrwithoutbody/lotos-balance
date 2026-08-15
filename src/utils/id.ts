// src/utils/id.ts

/** Identyfikator lokalny — prefiks tylko po to, żeby dane w localStorage dało się czytać okiem. */
export function makeId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

// src/utils/id.ts

let counter = 0

/** Prosty identyfikator lokalny — bez zależności, wystarczający dla danych w localStorage. */
export function makeId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`
}

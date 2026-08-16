// src/utils/plural.ts
/** Polska liczba mnoga: plural(3, 'osoba', 'osoby', 'osób'). */
export const plural = (n: number, one: string, few: string, many: string) =>
  n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many

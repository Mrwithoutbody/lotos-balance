// src/utils/plural.ts
const RULES = new Intl.PluralRules('pl')

/** Polska liczba mnoga: plural(3, 'osoba', 'osoby', 'osób'). */
export const plural = (n: number, one: string, few: string, many: string) =>
  ({ one, few, many, other: many, two: few, zero: many })[RULES.select(n)]

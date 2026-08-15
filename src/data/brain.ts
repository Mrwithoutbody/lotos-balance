// src/data/brain.ts
import type { BrainPillar } from '../types'

export interface BrainStep {
  pillar: BrainPillar
  pillarLabel: string
  icon: string
  color: string
  text: string
  hint: string
}

/** Cztery filary modułu „Mózg na lata”. Dziennie pokazujemy dokładnie jeden krok. */
export const BRAIN_STEPS: BrainStep[] = [
  {
    pillar: 'ruch',
    pillarLabel: 'Ruch',
    icon: 'Footprints',
    color: '#7B9A78',
    text: 'Wybierz siedmiominutowy spacer',
    hint: 'Najlepiej przy dziennym świetle. Liczy się regularność, nie dystans.',
  },
  {
    pillar: 'regeneracja',
    pillarLabel: 'Regeneracja i sen',
    icon: 'Moon',
    color: '#6C87A8',
    text: 'Ustal spokojną porę zakończenia dnia',
    hint: 'Wybierz godzinę, o której gasisz ekrany i zwalniasz tempo.',
  },
  {
    pillar: 'wyzwanie',
    pillarLabel: 'Wyzwanie poznawcze',
    icon: 'Puzzle',
    color: '#8B79B0',
    text: 'Naucz się dziś jednej nowej rzeczy',
    hint: 'Krótki tekst, kilka słów w obcym języku, nowa trasa do sklepu.',
  },
  {
    pillar: 'relacje',
    pillarLabel: 'Relacje społeczne',
    icon: 'Users',
    color: '#BC7680',
    text: 'Napisz do osoby, z którą dobrze Ci się rozmawia',
    hint: 'Jedno zdanie wystarczy. Kontakt liczy się bardziej niż jego długość.',
  },
]

/** Deterministyczny wybór kroku na dany dzień — rotacja po filarach. */
export function brainStepForDate(dateKey: string): BrainStep {
  const digits = dateKey.replace(/-/g, '')
  const day = Number(digits.slice(-4)) || 0
  return BRAIN_STEPS[day % BRAIN_STEPS.length]
}

export const SOURCES = [
  {
    label: 'The Lancet Commission / UCL — 14 modyfikowalnych czynników ryzyka',
    url: 'https://www.ucl.ac.uk/news/2024/jul/nearly-half-dementia-cases-could-be-prevented-or-delayed-tackling-14-risk-factors',
  },
  {
    label: 'US POINTER / JAMA — badanie nad stylem życia a funkcjami poznawczymi',
    url: 'https://jamanetwork.com/journals/jama/fullarticle/2837046',
  },
  {
    label: 'Brain Care Score / Mass General Brigham — jak dbać o zdrowie mózgu',
    url: 'https://www.massgeneralbrigham.org/en/about/newsroom/articles/improve-your-brain-health',
  },
]

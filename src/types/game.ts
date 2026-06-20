export type GrowthStage = 'egg' | 'chick' | 'juvenile' | 'subadult' | 'adult'

export type Weather = 'sunny' | 'rainy' | 'snowy' | 'stormy'

export type Personality = 'bold' | 'shy' | 'gentle' | 'curious' | 'stubborn'

export type BerryType = 'red' | 'blue' | 'golden'

export type GamePhase = 'start' | 'playing' | 'breeding' | 'ended'

export interface Bird {
  id: string
  name: string
  stage: GrowthStage
  stageProgress: number
  hunger: number
  fear: number
  health: number
  personality: Personality
  hatchDuration: number
  hatchTimeLeft: number
  isAway: boolean
  isSick: boolean
  isDead: boolean
  feedingCount: number
  lastFedAt: number
  colonyId?: string
  awayUntil?: number
  sickUntil?: number
  justHatched?: boolean
  justGrew?: boolean
  justFed?: boolean
  justMoved?: boolean
}

export interface Berry {
  id: string
  x: number
  y: number
  value: number
  type: BerryType
  spawnedAt: number
}

export interface WeatherEffect {
  hungerMod: number
  fearMod: number
  healthMod: number
  awayChance?: number
  sickChance?: number
  colonyHealthMod?: number
  colonyHungerMod?: number
}

export interface Colony {
  id: string
  name: string
  birdIds: string[]
  foodAllocation: number
  establishedAt: number
  healthMod: number
  hungerMod: number
  totalProduced: number
  daysSinceEstablished: number
}

export interface GameState {
  phase: GamePhase
  day: number
  dayProgress: number
  currentWeather: Weather
  nextWeatherChangeAt: number
  foodStock: number
  birds: Bird[]
  berries: Berry[]
  colonies: Colony[]
  totalHatched: number
  totalDied: number
  breedingCount: number
  maxBreedingRounds: number
  eventLog: { id: string; message: string; type: string; timestamp: number }[]
  score?: GameScore
  selectedBirdId?: string
  showColonyModal?: boolean
  selectedColonyBirdIds?: string[]
}

export interface GameScore {
  totalScore: number
  survivalRate: number
  avgHealth: number
  breedingBonus: number
  personalityBonus: number
  colonyBonus: number
  totalColonies: number
  stars: number
  rank: string
}

// import { PointsLeague } from './enums'

export type AccountPoints = {
  rank: string
  league: string
  totalPoints: string
  updatedAt: string
}

export type HistoricalPoints = {
  points: string
  volume: number
  periodStart: string
  periodEnd: string
}

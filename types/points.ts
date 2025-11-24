export enum PointsLeague {
  White = 'white',
  Orange = 'orange',
  Blue = 'blue',
  Purple = 'purple',
  Black = 'black'
}

export enum PointsPeriod {
  Day = 'day',
  Week = 'week'
}

export type AccountPoints = {
  rank: string
  league: string
  updatedAt: string
  totalPoints: string
  pointsBonus: number
  pointsSeason1: number
  totalPointsPrecise: number
}

export type HistoricalPoints = {
  day: string
  week: string
  points: string
  volume: number
  pointsPrecise: number
}

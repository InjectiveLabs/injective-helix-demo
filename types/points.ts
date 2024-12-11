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
  totalPoints: string
  updatedAt: string
}

export type HistoricalPoints = {
  points: string
  pointsPrecise: number
  volume: number
  week: string
  day: string
}

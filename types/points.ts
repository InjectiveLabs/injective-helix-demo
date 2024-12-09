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
  volume: number
  periodStart: string
  periodEnd: string
}

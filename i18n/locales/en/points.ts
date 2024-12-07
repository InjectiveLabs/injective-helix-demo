import { PointsLeague, I18nMessageFunction } from '@/types'

export default {
  points: {
    day: 'Day',
    week: 'Week',
    points: 'Points',
    volume: 'Volume',
    title: 'Points',
    description:
      '[PLACEHOLDER] Earn points by using Helix. Points are distributed on [dayOfWeek]',
    totalPoints: 'Total Points',
    rank: 'Rank',
    league: 'League',
    myTotalPoints: 'My total points on Helix',
    saveImage: 'Save image',
    lastUpdatedAt: 'Last updated at ',
    paginationDetails: ({ named }: I18nMessageFunction) =>
      `${named('from')} to ${named('to')}`,
    leagues: {
      [PointsLeague.White]: 'White',
      [PointsLeague.Orange]: 'Orange',
      [PointsLeague.Blue]: 'Blue',
      [PointsLeague.Purple]: 'Purple',
      [PointsLeague.Black]: 'Black'
    }
  }
}

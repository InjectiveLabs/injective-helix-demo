import { PointsLeague } from '@/types'

export default {
  points: {
    rank: 'Rank',
    level: 'Level',
    share: 'Share',
    title: 'Points',
    period: 'Period',
    points: 'Points',
    volume: 'Volume',
    totalPoints: 'Total Points',
    lastUpdatedAt: 'Last updated at ',
    myTotalPoints: 'My total points on Helix',
    paginationDetails: '{from}-{to} of {total}',
    description:
      'Season 1 is officially closed. But don’t worry if you missed out! Stay tuned for upcoming opportunities.',

    leagues: {
      [PointsLeague.Blue]: 'Blue Belt',
      [PointsLeague.Black]: 'Black Belt',
      [PointsLeague.White]: 'White Belt',
      [PointsLeague.Orange]: 'Orange Belt',
      [PointsLeague.Purple]: 'Purple Belt'
    }
  }
}

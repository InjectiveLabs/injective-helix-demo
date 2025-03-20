import { PointsLeague } from './../../../types'

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
    leagues: {
      [PointsLeague.Blue]: 'Blue Belt',
      [PointsLeague.Black]: 'Black Belt',
      [PointsLeague.White]: 'White Belt',
      [PointsLeague.Orange]: 'Orange Belt',
      [PointsLeague.Purple]: 'Purple Belt'
    },
    paginationDetails: '{from}-{to} of {total}',
    description:
      'Trade on Helix and earn points. Points are distributed every single day. For more information, see'
  }
}

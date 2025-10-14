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
    bonusPoints: 'Bonus Points',
    paginationDetails: '{from}-{to} of {total}',
    totalPointsPlusBonus: 'Total Points + Bonus',
    subtitle: 'The Helix Points Bonus Has Arrived',
    season1Points: 'Season 1 Points (From start until July 15, 2025)',
    description1: 'Season 1 of Helix Points officially ended on July 15, 2025.',
    description2:
      'To show appreciation for loyal users, Helix has been quietly tracking bonus points for active traders behind the scenes. We’ve also granted extra rewards to users liquidated during volatile market periods in recognition of their trading activity.',
    description3:
      'Stay tuned for more updates through the official Helix website and social channels.',

    leagues: {
      [PointsLeague.Blue]: 'Blue Belt',
      [PointsLeague.Black]: 'Black Belt',
      [PointsLeague.White]: 'White Belt',
      [PointsLeague.Orange]: 'Orange Belt',
      [PointsLeague.Purple]: 'Purple Belt'
    }
  }
}

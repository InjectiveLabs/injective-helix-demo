import { indexerGrpcArchiverApi } from '@/app/Services'
import { LeaderboardType } from '@/types'

export const fetchPnlLeaderboard = async (
  resolution: string,
  account?: string
) => {
  const leaderboardStore = useLeaderboardStore()

  leaderboardStore.$patch({
    pnlLeaderboard:
      await indexerGrpcArchiverApi.fetchPnlLeaderboardFixedResolution({
        account,
        resolution
      })
  })
}

export const fetchCompetitionLeaderboard = async ({
  type,
  account,
  duration
}: {
  type: LeaderboardType
  account?: string
  duration: {
    startDate: string
    endDate: string
  }
}) => {
  const leaderboardStore = useLeaderboardStore()

  if (type === LeaderboardType.Pnl) {
    leaderboardStore.$patch({
      competitionLeaderboard: await indexerGrpcArchiverApi.fetchPnlLeaderboard({
        account,
        endDate: duration.endDate,
        startDate: duration.startDate
      })
    })

    return
  }

  leaderboardStore.$patch({
    competitionLeaderboard: await indexerGrpcArchiverApi.fetchVolLeaderboard({
      account,
      endDate: duration.endDate,
      startDate: duration.startDate
    })
  })
}

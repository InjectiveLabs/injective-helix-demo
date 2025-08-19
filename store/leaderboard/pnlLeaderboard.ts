import { getIndexerGrpcArchiverApi } from '@/app/Services'
import { LeaderboardType } from '@/types'

export const fetchPnlLeaderboard = async (
  resolution: string,
  account?: string
) => {
  const indexerGrpcArchiverApi = await getIndexerGrpcArchiverApi()

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
  account?: string
  type: LeaderboardType
  duration: {
    endDate: string
    startDate: string
  }
}) => {
  const indexerGrpcArchiverApi = await getIndexerGrpcArchiverApi()

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

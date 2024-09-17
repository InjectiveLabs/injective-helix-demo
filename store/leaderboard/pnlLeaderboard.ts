import { indexerGrpcArchiverApi } from '@/app/Services'
import { LeaderboardType } from '@/types'

const PNL_LEADERBOARD_LIMIT = 500

export const fetchPnlLeaderboard = async (resolution: string) => {
  const leaderboardStore = useLeaderboardStore()

  leaderboardStore.$patch({
    pnlLeaderboard:
      await indexerGrpcArchiverApi.fetchPnlLeaderboardFixedResolution({
        resolution,
        limit: PNL_LEADERBOARD_LIMIT
      })
  })
}

export const fetchCompetitionLeaderboard = async ({
  type,
  duration
}: {
  type: LeaderboardType
  duration: {
    startDate: string
    endDate: string
  }
}) => {
  const leaderboardStore = useLeaderboardStore()

  if (type === LeaderboardType.Pnl) {
    leaderboardStore.$patch({
      competitionLeaderboard: await indexerGrpcArchiverApi.fetchPnlLeaderboard({
        endDate: duration.endDate,
        startDate: duration.startDate,
        limit: PNL_LEADERBOARD_LIMIT
      })
    })

    return
  }

  leaderboardStore.$patch({
    competitionLeaderboard: await indexerGrpcArchiverApi.fetchVolLeaderboard({
      endDate: duration.endDate,
      startDate: duration.startDate,
      limit: PNL_LEADERBOARD_LIMIT
    })
  })
}

export const fetchPnlLeaderboardAccount = async ({
  account,
  resolution
}: {
  account: string
  resolution: string
}) => {
  const leaderboardStore = useLeaderboardStore()

  const { accountRow: pnlLeaderboardAccount } =
    await indexerGrpcArchiverApi.fetchPnlLeaderboardFixedResolution({
      account,
      limit: 1,
      resolution
    })

  leaderboardStore.$patch({
    pnlLeaderboardAccount
  })
}

export const fetchCompetitionLeaderboardAccount = async ({
  type,
  account,
  duration
}: {
  type: LeaderboardType
  account: string
  duration: {
    startDate: string
    endDate: string
  }
}) => {
  const leaderboardStore = useLeaderboardStore()

  if (type === LeaderboardType.Pnl) {
    const { accountRow: competitionLeaderboardAccount } =
      await indexerGrpcArchiverApi.fetchPnlLeaderboard({
        account,
        limit: 1,
        endDate: duration.endDate,
        startDate: duration.startDate
      })

    leaderboardStore.$patch({
      competitionLeaderboardAccount
    })

    return
  }

  const { accountRow: competitionLeaderboardAccount } =
    await indexerGrpcArchiverApi.fetchVolLeaderboard({
      account,
      endDate: duration.endDate,
      startDate: duration.startDate,
      limit: 1
    })

  leaderboardStore.$patch({
    competitionLeaderboardAccount
  })
}

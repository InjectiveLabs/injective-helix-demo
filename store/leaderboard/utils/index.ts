import { indexerGrpcArchiverApi } from '@/app/Services'
import { LeaderboardType } from '@/types'

export const fetchLeaderboardByResolution = async (
  type: LeaderboardType,
  resolution: string
) => {
  if (type === LeaderboardType.Pnl) {
    const pnlLeaderboard =
      await indexerGrpcArchiverApi.fetchPnlLeaderboardFixedResolution({
        resolution
      })

    return pnlLeaderboard
  }

  const volumeLeaderboard =
    await indexerGrpcArchiverApi.fetchVolLeaderboardFixedResolution({
      resolution
    })

  return volumeLeaderboard
}

export const fetchLeaderboardByDuration = async (
  type: LeaderboardType,
  duration: { startDate: string; endDate: string }
) => {
  if (type === LeaderboardType.Pnl) {
    const pnlLeaderboard = await indexerGrpcArchiverApi.fetchPnlLeaderboard({
      endDate: duration.endDate,
      startDate: duration.startDate
    })

    return pnlLeaderboard
  }

  const volumeLeaderboard = await indexerGrpcArchiverApi.fetchVolLeaderboard({
    endDate: duration.endDate,
    startDate: duration.startDate
  })

  return volumeLeaderboard
}

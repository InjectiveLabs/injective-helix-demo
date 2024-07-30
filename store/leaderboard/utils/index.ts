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
  duration: { startDate: number; endDate: number }
) => {
  if (type === LeaderboardType.Pnl) {
    const pnlLeaderboard = await indexerGrpcArchiverApi.fetchPnlLeaderboard({
      startDate: duration.startDate,
      endDate: duration.endDate
    })

    return pnlLeaderboard
  }

  const volumeLeaderboard = await indexerGrpcArchiverApi.fetchVolLeaderboard({
    startDate: duration.startDate,
    endDate: duration.endDate
  })

  return volumeLeaderboard
}

import { Campaign } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { toBalanceInToken } from '@/app/utils/formatters'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  LiquidityDashboardTableColumn,
  TransformedLiquidityDashboard
} from '@/types'

export function useLiquidityDashboardTransformer(
  campaignList: ComputedRef<Campaign[]>
) {
  const spotStore = useSpotStore()
  const tokenStore = useTokenStore()

  const rows = computed(() =>
    campaignList.value.reduce((list, campaign) => {
      const market = spotStore.markets.find(
        (market) => market.marketId === campaign.marketId
      )

      if (!market) {
        return list
      }

      const marketVolumeInUsd = new BigNumberInBase(
        toBalanceInToken({
          value: campaign.userScore || 0,
          decimalPlaces:
            market.quoteToken?.decimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS
        })
      ).times(tokenStore.tokenUsdPrice(market.quoteToken))

      const userScore = campaign.userScore

      const totalScore = campaign.totalScore

      const estRewardsInPercentage =
        userScore && totalScore
          ? new BigNumberInBase(userScore).dividedBy(totalScore)
          : ZERO_IN_BASE

      const rewards = campaign.rewards.map((reward) => {
        const token = tokenStore.tokenByDenomOrSymbol(reward.denom)

        const amount = new BigNumberInWei(estRewardsInPercentage)
          .multipliedBy(reward.amount || 0)
          .toBase(token?.decimals || 0)

        const amountInUsd = token
          ? new BigNumberInBase(amount).times(tokenStore.tokenUsdPrice(token))
          : ZERO_IN_BASE

        return {
          amount,
          symbol: token?.symbol || '',
          amountInUsd
        }
      })

      const totalAmountInUsd = rewards.reduce(
        (total, reward) => total.plus(reward.amountInUsd),
        ZERO_IN_BASE
      )

      list.push({
        campaign,
        totalAmountInUsd,
        marketVolumeInUsd,
        token: market.baseToken,
        campaignId: campaign.campaignId,
        [LiquidityDashboardTableColumn.Market]: market,
        [LiquidityDashboardTableColumn.Rewards]: rewards
      })

      return list
    }, [] as TransformedLiquidityDashboard[])
  )

  return { rows }
}

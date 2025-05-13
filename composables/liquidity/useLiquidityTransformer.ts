import { usdtToken } from '@shared/data/token'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { CURRENT_MARKET_TO_LEGACY_MARKET_ID_MAP } from '@/app/utils/constants'
import { LiquidityTableColumn } from '@/types'
import type { TransformedLiquidity } from '@/types'
import type { Campaign } from '@injectivelabs/sdk-ts'

export function useLiquidityTransformer(campaignList: ComputedRef<Campaign[]>) {
  const spotStore = useSpotStore()
  const sharedTokenStore = useSharedTokenStore()
  const gridStrategyStore = useGridStrategyStore()

  const rows = computed(() =>
    campaignList.value.reduce((list, campaign) => {
      const market = spotStore.marketByIdOrSlug(campaign.marketId)!

      if (!market) {
        return list
      }

      const userHasActiveLegacyStrategy =
        gridStrategyStore.activeSpotStrategies.some(
          (strategy) =>
            strategy.marketId ===
            CURRENT_MARKET_TO_LEGACY_MARKET_ID_MAP[campaign.marketId]
        )

      const rewardsWithToken = campaign.rewards.map((reward) => {
        const token = sharedTokenStore.tokenByDenomOrSymbol(reward.denom)

        return {
          value: sharedToBalanceInToken({
            value: reward.amount,
            decimalPlaces: token?.decimals || 18
          }),
          token
        }
      })

      const totalRewardsInUsd = rewardsWithToken.reduce((total, reward) => {
        return total.plus(
          new BigNumberInBase(reward.value).times(
            sharedTokenStore.tokenUsdPrice(reward.token)
          )
        )
      }, ZERO_IN_BASE)

      const marketVolume = new BigNumberInWei(campaign.totalScore || 0).toBase(
        market.quoteToken.decimals || usdtToken.decimals
      )

      const marketVolumeInUsd = marketVolume.times(
        sharedTokenStore.tokenUsdPrice(market.quoteToken)
      )

      list.push({
        rewardsWithToken,
        totalRewardsInUsd,
        marketVolumeInUsd,
        userHasActiveLegacyStrategy,
        baseToken: market.baseToken,
        campaignId: campaign.campaignId,
        [LiquidityTableColumn.Market]: market
      })

      return list
    }, [] as TransformedLiquidity[])
  )

  return { rows }
}

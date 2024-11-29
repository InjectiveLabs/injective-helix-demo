import { usdtToken } from '@shared/data/token'
import { Campaign } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { toBalanceInToken } from '@/app/utils/formatters'
import { CURRENT_MARKET_TO_LEGACY_MARKET_ID_MAP } from '@/app/utils/constants'
import { LiquidityTableColumn, TransformedLiquidity } from '@/types'

export function useLiquidityTransformer(campaignList: ComputedRef<Campaign[]>) {
  const spotStore = useSpotStore()
  const tokenStore = useTokenStore()
  const gridStrategyStore = useGridStrategyStore()

  const rows = computed(() =>
    campaignList.value.reduce((list, campaign) => {
      const market = spotStore.markets.find(
        (market) => market.marketId === campaign.marketId
      )!

      if (!market) {
        return list
      }

      const userHasActiveLegacyStrategy =
        gridStrategyStore.activeStrategies.some(
          (strategy) =>
            strategy.marketId ===
            CURRENT_MARKET_TO_LEGACY_MARKET_ID_MAP[campaign.marketId]
        )

      const rewardsWithToken = campaign.rewards.map((reward) => {
        const token = tokenStore.tokenByDenomOrSymbol(reward.denom)

        return {
          value: toBalanceInToken({
            value: reward.amount,
            decimalPlaces: token?.decimals || 18
          }),
          token
        }
      })

      const totalRewardsInUsd = rewardsWithToken.reduce((total, reward) => {
        return total.plus(
          new BigNumberInBase(reward.value).times(
            tokenStore.tokenUsdPrice(reward.token)
          )
        )
      }, ZERO_IN_BASE)

      const marketVolume = new BigNumberInWei(campaign.totalScore || 0).toBase(
        market.quoteToken.decimals || usdtToken.decimals
      )

      const marketVolumeInUsd = marketVolume.times(
        tokenStore.tokenUsdPrice(market.quoteToken)
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

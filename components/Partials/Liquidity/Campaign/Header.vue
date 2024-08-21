<script setup lang="ts">
import { Campaign } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  sharedToBalanceInToken,
  sharedToBalanceInTokenInBase
} from '@shared/utils/formatter'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { LiquidityRewardsPage, UiMarketWithToken } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
    campaign: Campaign
  }>(),
  {}
)

const tokenStore = useTokenStore()
const sharedWalletStore = useSharedWalletStore()

const rewardsWithToken = computed(() => {
  return props.campaign.rewards.map((reward) => {
    const token = tokenStore.tokenByDenomOrSymbol(reward.denom)

    return {
      token,
      value: sharedToBalanceInToken({
        value: reward.amount,
        decimalPlaces: token?.decimals
      })
    }
  })
})

const { valueToString: totalRewardsInUsdToString } =
  useSharedBigNumberFormatter(
    computed(() => {
      return props.campaign.rewards.reduce((total, reward) => {
        const token = tokenStore.tokenByDenomOrSymbol(reward.denom)

        if (!token) {
          return total
        }

        const rewardInBase = sharedToBalanceInToken({
          value: reward.amount,
          decimalPlaces: token.decimals
        })

        const rewardInUsd = new BigNumberInBase(rewardInBase).times(
          tokenStore.tokenUsdPrice(token)
        )

        return total.plus(rewardInUsd)
      }, ZERO_IN_BASE)
    }),
    { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
  )

const { valueToString: volumeInUsdToString } = useSharedBigNumberFormatter(
  computed(() =>
    sharedToBalanceInTokenInBase({
      value: props.campaign.totalScore,
      decimalPlaces: props.market.quoteToken.decimals
    }).times(tokenStore.tokenUsdPrice(props.market.quoteToken))
  ),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)
</script>

<template>
  <div>
    <div class="flex space-x-4">
      <NuxtLink
        :to="{ name: LiquidityRewardsPage.Home }"
        class="flex items-center space-x-2"
      >
        <SharedIcon name="arrow" />
        <p>{{ $t('campaign.title') }}</p>
      </NuxtLink>
    </div>

    <div class="flex items-center my-4">
      <div>
        <CommonTokenIcon is-xl v-bind="{ token: market.baseToken }" />
      </div>

      <div class="mx-2">
        <h3 class="text-xl sm:text-3xl font-bold">{{ market.ticker }}</h3>
        <p class="text-gray-500">{{ market.baseToken.name }}</p>
      </div>

      <div class="flex items-center ml-auto">
        <NuxtLink
          v-if="sharedWalletStore.isUserConnected"
          :to="{ name: LiquidityRewardsPage.Dashboard }"
          class="block leading-5 py-2 px-5 font-semibold whitespace-nowrap bg-blue-500 text-blue-900 border-blue-500 hover:bg-blue-600 border rounded-lg"
        >
          {{ $t('campaign.myRewards') }}
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-gray-500 mb-2">
          {{ $t('campaign.rewardsRound') }}
        </p>
        <h3 class="text-xl font-semibold">
          {{ totalRewardsInUsdToString }} USD
        </h3>
        <div class="flex items-center space-x-2">
          <template v-for="(reward, index) in rewardsWithToken" :key="index">
            <PartialsLiquidityCommonTokenAmount
              v-if="reward.token"
              v-bind="{
                amount: reward.value,
                symbol: reward.token.symbol,
                index
              }"
            />
          </template>
        </div>
      </div>

      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-gray-500 mb-2">
          {{ $t('campaign.volume') }}
        </p>
        <h3 class="text-xl font-semibold">{{ volumeInUsdToString }} USD</h3>
      </div>
    </div>
  </div>
</template>

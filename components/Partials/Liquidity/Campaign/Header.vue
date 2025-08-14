<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  sharedToBalanceInToken,
  sharedToBalanceInTokenInBase
} from '@shared/utils/formatter'
import { LiquidityRewardsPage } from '@/types'
import type { UiMarketWithToken } from '@/types'
import type { Campaign } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    campaign: Campaign
    market: UiMarketWithToken
  }>(),
  {}
)

const sharedTokenStore = useSharedTokenStore()
const sharedWalletStore = useSharedWalletStore()

const rewardsWithToken = computed(() => {
  return props.campaign.rewards.map((reward) => {
    const token = sharedTokenStore.tokenByDenomOrSymbol(reward.denom)

    return {
      token,
      value: sharedToBalanceInToken({
        value: reward.amount,
        decimalPlaces: token?.decimals
      })
    }
  })
})

const totalRewardsInUsd = computed(() => {
  return props.campaign.rewards.reduce((total, reward) => {
    const token = sharedTokenStore.tokenByDenomOrSymbol(reward.denom)

    if (!token) {
      return total
    }

    const rewardInBase = sharedToBalanceInTokenInBase({
      value: reward.amount,
      decimalPlaces: token.decimals
    })

    const rewardInUsd = rewardInBase.times(
      sharedTokenStore.tokenUsdPrice(token)
    )

    return total.plus(rewardInUsd)
  }, ZERO_IN_BASE)
})

const volumeInUsd = computed(() =>
  sharedToBalanceInTokenInBase({
    value: props.campaign.totalScore,
    decimalPlaces: props.market.quoteToken.decimals
  }).times(sharedTokenStore.tokenUsdPrice(props.market.quoteToken))
)
</script>

<template>
  <div>
    <div class="flex space-x-4">
      <NuxtLink
        :to="{ name: LiquidityRewardsPage.Home }"
        class="flex items-center space-x-2"
      >
        <UIcon :name="NuxtUiIcons.ArrowLeft" class="h-6 w-6 min-w-6" />
        <p>{{ $t('lpRewards.title') }}</p>
      </NuxtLink>
    </div>

    <div class="flex items-center my-4">
      <div>
        <CommonTokenIcon is-xl v-bind="{ token: market.baseToken }" />
      </div>

      <div class="mx-2">
        <h3 class="text-xl sm:text-3xl font-bold">{{ market.ticker }}</h3>
        <p class="text-coolGray-500">{{ market.baseToken.name }}</p>
      </div>

      <div class="flex items-center ml-auto">
        <NuxtLink
          v-if="sharedWalletStore.isUserConnected"
          :to="{ name: LiquidityRewardsPage.Dashboard }"
          class="block leading-5 py-2 px-5 font-semibold whitespace-nowrap bg-blue-500 text-blue-900 border-blue-500 hover:bg-blue-600 border rounded-lg"
        >
          {{ $t('lpRewards.myRewards') }}
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="border rounded-md p-4">
        <p class="text-xs uppercase text-coolGray-500 mb-2">
          {{ $t('lpRewards.rewardsRound') }}
        </p>
        <h3 class="text-xl font-semibold">
          <SharedAmountUsd
            v-bind="{
              shouldAbbreviate: false,
              amount: totalRewardsInUsd
            }"
          />
          USD
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
        <p class="text-xs uppercase text-coolGray-500 mb-2">
          {{ $t('lpRewards.volume') }}
        </p>
        <h3 class="text-xl font-semibold">
          <SharedAmountUsd
            v-bind="{
              hideDecimals: true,
              amount: volumeInUsd,
              shouldAbbreviate: false,
              roundingMode: BigNumberInBase.ROUND_UP
            }"
          />
          USD
        </h3>
      </div>
    </div>
  </div>
</template>

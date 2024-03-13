<script setup lang="ts">
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { INJ_COIN_GECKO_ID, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { BTC_COIN_GECKO_ID } from '~/app/utils/constants'
import { AccountBalance } from '~/types'

const appStore = useAppStore()
const tokenStore = useTokenStore()
const exchangeStore = useExchangeStore()

const { aggregatedPortfolioBalances } = useBalance()

const aggregatedAccountBalances = computed(() =>
  Object.keys(aggregatedPortfolioBalances.value).reduce(
    (balances, subaccountId) => [
      ...balances,
      ...aggregatedPortfolioBalances.value[subaccountId]
    ],
    [] as AccountBalance[]
  )
)

const stakedAmount = computed(() => {
  if (
    !exchangeStore.feeDiscountAccountInfo ||
    !exchangeStore.feeDiscountAccountInfo.accountInfo
  ) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(
    cosmosSdkDecToBigNumber(
      exchangeStore.feeDiscountAccountInfo.accountInfo.stakedAmount
    )
  )
})

const stakedAmountInUsd = computed(() => {
  const injUsdPrice = tokenStore.tokenUsdPriceByCoinGeckoId(INJ_COIN_GECKO_ID)

  if (!injUsdPrice) {
    return ZERO_IN_BASE
  }

  return stakedAmount.value.times(injUsdPrice)
})

const accountTotalBalanceInUsd = computed(() =>
  aggregatedAccountBalances.value
    .reduce(
      (total, balance) =>
        total.plus(
          new BigNumberInWei(balance.accountTotalBalanceInUsd).toBase(
            balance.token.decimals
          )
        ),
      ZERO_IN_BASE
    )
    .plus(stakedAmountInUsd.value)
)

const accountTotalBalanceInBtc = computed(() => {
  const btcUsdPrice = tokenStore.tokenUsdPriceByCoinGeckoId(BTC_COIN_GECKO_ID)

  if (!btcUsdPrice) {
    return ZERO_IN_BASE
  }

  return accountTotalBalanceInUsd.value.dividedBy(btcUsdPrice)
})
</script>

<template>
  <div class="flex justify-between">
    <div class="space-y-2">
      <p class="text-gray-400 text-sm">
        {{ $t('portfolio.balances.netWorth') }}
      </p>
      <div class="flex items-center space-x-4">
        <p class="text-2xl font-semibold flex items-center space-x-2 h-12">
          <span>$</span>
          <CommonSkeletonSubaccountAmount :size="34" :spacing="8" :width="16">
            <CommonNumberCounter
              v-bind="{ value: accountTotalBalanceInUsd.toNumber() }"
              :size="24"
            />
          </CommonSkeletonSubaccountAmount>
        </p>

        <button
          class="text-gray-500 flex justify-center cursor-pointer"
          @click="appStore.toggleHideBalances"
        >
          <BaseIcon
            v-if="appStore.userState.preferences.isHideBalances"
            name="hide"
            class="w-8 h-5 -translate-x-[2px]"
          />

          <BaseIcon v-else name="show" class="w-7" />
        </button>
      </div>

      <p class="text-gray-400 text-sm flex items-center space-x-2 h-6">
        <span>≈</span>
        <CommonSkeletonSubaccountAmount>
          <CommonNumberCounter
            :decimals="4"
            v-bind="{ value: accountTotalBalanceInBtc.toNumber(), size: 14 }"
          />
        </CommonSkeletonSubaccountAmount>
        <span class="pb-[2px]">BTC</span>
      </p>
    </div>

    <div class="flex items-center space-x-2">
      <AppButton>{{ $t('common.deposit') }}</AppButton>

      <AppButton variant="primary-outline">
        {{ $t('common.withdraw') }}
      </AppButton>

      <AppButton variant="primary-outline">
        {{ $t('common.transfer') }}
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei, formatWalletAddress } from '@injectivelabs/utils'

const props = withDefaults(
  defineProps<{
    subaccount: {
      display: string
      value: string
    }
  }>(),
  {}
)

const { aggregatedPortfolioBalances } = useBalance()

const formattedAddress = computed(() =>
  formatWalletAddress(props.subaccount.value)
)

const balance = computed(() =>
  aggregatedPortfolioBalances.value[props.subaccount.value].reduce(
    (sum, balance) => {
      const balanceInUsd = new BigNumberInWei(
        balance.accountTotalBalanceInUsd
      ).toBase(balance.token.decimals)

      return sum.plus(balanceInUsd)
    },
    ZERO_IN_BASE
  )
)
</script>

<template>
  <div class="p-2 text-xs flex">
    <div class="flex-1 items-center p-2">
      {{ $t('account.subaccount') }} {{ subaccount.display }}
    </div>
    <div class="flex-1 items-center p-2">
      <PartialsWalletHistoryCommonAddress is-xs :address="subaccount.value">
        {{ formattedAddress }}
      </PartialsWalletHistoryCommonAddress>
    </div>
    <div class="flex-1 items-center p-2 text-right">
      <span class="mr-1">$</span>
      <AppUsdAmount
        v-bind="{
          amount: balance.toFixed()
        }"
      />
    </div>
  </div>
</template>

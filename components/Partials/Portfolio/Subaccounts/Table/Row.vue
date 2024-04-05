<script setup lang="ts">
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei, formatWalletAddress } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '~/app/utils/constants'

const props = defineProps({
  subaccount: {
    type: Object as PropType<{
      display: string
      value: string
    }>,
    required: true
  }
})

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

const { valueToString: balanceToString } = useBigNumberFormatter(balance, {
  decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
})
</script>

<template>
  <div class="p-2 text-xs flex">
    <div class="flex-1 items-center p-2">
      {{ $t('account.subaccount') }} {{ subaccount.display }}
    </div>
    <div class="flex-1 items-center p-2">
      <PartialsActivityViewsWalletHistoryCommonAddress
        is-xs
        :address="subaccount.value"
      >
        {{ formattedAddress }}
      </PartialsActivityViewsWalletHistoryCommonAddress>
    </div>
    <div class="flex-1 items-center p-2">$ {{ balanceToString }}</div>
  </div>
</template>

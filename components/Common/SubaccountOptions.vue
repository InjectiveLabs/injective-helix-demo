<script setup lang="ts">
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  getMarketSlugFromSubaccountId,
  getSubaccountIndex,
  isSgtSubaccountId
} from '@/app/utils/helpers'

const props = defineProps({
  includeBotsSubaccounts: Boolean,
  showLowBalance: Boolean
})

const accountStore = useAccountStore()
const walletStore = useWalletStore()
const { aggregatedPortfolioBalances } = useBalance()
const { t } = useLang()

const subaccountOptions = computed(() =>
  accountStore.hasMultipleSubaccounts
    ? Object.keys(aggregatedPortfolioBalances.value)
        .filter((subaccountId) => {
          const includeBotsSubaccounts = props.includeBotsSubaccounts
            ? true
            : !isSgtSubaccountId(subaccountId)

          const hasBalance = aggregatedPortfolioBalances.value[
            subaccountId
          ].some((balance) =>
            new BigNumberInBase(balance.accountTotalBalance)
              .dp(0, BigNumber.ROUND_DOWN)
              .gt(0)
          )

          const includeLowBalance = props.showLowBalance
            ? true
            : hasBalance || subaccountId === walletStore.defaultSubaccountId

          return includeBotsSubaccounts && includeLowBalance
        })
        .map((value) => {
          if (getSubaccountIndex(value) === 0) {
            return { display: `${t('account.main')}`, value }
          }

          if (isSgtSubaccountId(value)) {
            return {
              value,
              display: `SGT ${getMarketSlugFromSubaccountId(value)}`
            }
          }

          return {
            value,
            display: getSubaccountIndex(value).toString()
          }
        })
        .sort((a, b) => a.value.localeCompare(b.value))
    : []
)
</script>

<template>
  <slot v-bind="{ subaccountOptions }" />
</template>

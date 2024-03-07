<script setup lang="ts">
import { BigNumberInWei } from '@injectivelabs/utils'
import {
  getMarketSlugFromSubaccountId,
  getSubaccountIndex,
  isSgtSubaccountId
} from '@/app/utils/helpers'
import { DUST_AMOUNT_THRESHOLD } from '@/app/utils/constants'

const props = defineProps({
  includeBotsSubaccounts: Boolean,
  showLowBalance: Boolean
})

const accountStore = useAccountStore()
const walletStore = useWalletStore()
const { aggregatedPortfolioBalances } = useBalance()
const { t } = useLang()

const subaccountOptions = computed(() =>
  Object.keys(aggregatedPortfolioBalances.value)
    .filter((subaccountId) => {
      const includeBotsSubaccounts =
        props.includeBotsSubaccounts || !isSgtSubaccountId(subaccountId)

      const hasBalance = aggregatedPortfolioBalances.value[subaccountId].some(
        (balance) =>
          new BigNumberInWei(balance.accountTotalBalance).gte(
            DUST_AMOUNT_THRESHOLD
          )
      )

      const includeLowBalance =
        props.showLowBalance ||
        hasBalance ||
        subaccountId === walletStore.defaultSubaccountId

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
)

const activeSubaccountLabel = computed(
  () =>
    subaccountOptions.value.find(
      (option) => option.value === accountStore.subaccountId
    )?.display
)
</script>

<template>
  <slot v-bind="{ subaccountOptions, activeSubaccountLabel }" />
</template>

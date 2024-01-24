<script lang="ts" setup>
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS,
  UI_MINIMAL_ABBREVIATION_FLOOR
} from '@/app/utils/constants'
import { AccountBalance } from '@/types'
import {
  getMarketSlugFromSubaccountId,
  getSubaccountIndex,
  isSgtSubaccountId
} from '@/app/utils/helpers'

const props = defineProps({
  isHideBalances: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  },

  subaccountId: {
    type: String,
    required: true
  }
})

const accountStore = useAccountStore()
const { t } = useLang()

const isSelectedSubaccountId = computed(
  () => accountStore.subaccountId === props.subaccountId
)

const accountTotalBalanceInUsd = computed(() =>
  props.balances.reduce(
    (total, balance) =>
      total.plus(
        new BigNumberInWei(balance.accountTotalBalanceInUsd).toBase(
          balance.token.decimals
        )
      ),
    ZERO_IN_BASE
  )
)

const shouldAbbreviateTotalBalance = computed(() =>
  accountTotalBalanceInUsd.value.gte(UI_MINIMAL_ABBREVIATION_FLOOR)
)

const subaccountFormatted = computed(() => {
  if (getSubaccountIndex(props.subaccountId) === 0) {
    return `${t('account.main')}`
  }

  if (isSgtSubaccountId(props.subaccountId)) {
    return `SGT ${getMarketSlugFromSubaccountId(props.subaccountId)}`
  }

  return getSubaccountIndex(props.subaccountId).toString()
})

const { valueToString: abbreviatedTotalBalanceToString } =
  useBigNumberFormatter(accountTotalBalanceInUsd, {
    decimalPlaces: shouldAbbreviateTotalBalance.value
      ? 0
      : UI_DEFAULT_MIN_DISPLAY_DECIMALS,
    abbreviationFloor: shouldAbbreviateTotalBalance.value
      ? UI_MINIMAL_ABBREVIATION_FLOOR
      : undefined
  })

const formattedTotalBalanceToString = computed(() => {
  const minAmount = new BigNumberInBase(1).shiftedBy(
    -UI_DEFAULT_MIN_DISPLAY_DECIMALS
  )

  return accountTotalBalanceInUsd.value.gte(minAmount)
    ? abbreviatedTotalBalanceToString.value
    : `< ${minAmount.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)}`
})

function selectSubaccount() {
  accountStore.$patch({ subaccountId: props.subaccountId })
}
</script>

<template>
  <div
    class="rounded-2xl px-4 py-2 flex min-w-3xs cursor-pointer hover:bg-white/10"
    :class="{
      'bg-white/10': isSelectedSubaccountId
    }"
    @click="selectSubaccount"
  >
    <div class="space-y-3">
      <h3 class="flex items-center">
        <span class="text-gray-300 text-xs tracking-wide uppercase">
          {{ $t('account.account') }}
          {{ subaccountFormatted }}
        </span>
      </h3>
      <p class="font-sans text-lg font-semibold text-white">
        $
        {{
          isHideBalances
            ? HIDDEN_BALANCE_DISPLAY
            : formattedTotalBalanceToString
        }}
        USD
      </p>
    </div>
  </div>
</template>

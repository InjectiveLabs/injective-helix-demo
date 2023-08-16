<script setup lang="ts">
import { PropType } from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei } from '@injectivelabs/utils'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_MINIMAL_ABBREVIATION_FLOOR
} from '@/app/utils/constants'
import { AccountBalance } from '@/types'
import {
  addSubacountIdToEthAddress,
  getSubaccountIndex
} from '@/app/utils/helpers'
import { spotGridMarketsWithSubaccount } from 'app/utils/constants/grid-spot-trading'

const props = defineProps({
  hideBalances: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  },

  subaccountId: {
    type: String,
    required: true
  }
})

const walletStore = useWalletStore()
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
  const isSpotGridSubaccount = spotGridMarketsWithSubaccount.find(
    (spotGrid) =>
      addSubacountIdToEthAddress(walletStore.address, spotGrid.subaccountId) ===
      props.subaccountId
  )

  let display

  if (getSubaccountIndex(props.subaccountId) === 0) {
    display = `${t('account.main')}`
  } else if (isSpotGridSubaccount) {
    display = `SGT ${isSpotGridSubaccount.slug}`
  } else {
    display = getSubaccountIndex(props.subaccountId).toString()
  }

  return display
})

const { valueToString: abbreviatedTotalBalanceToString } =
  useBigNumberFormatter(accountTotalBalanceInUsd, {
    decimalPlaces: shouldAbbreviateTotalBalance.value ? 0 : 2,
    abbreviationFloor: shouldAbbreviateTotalBalance.value
      ? UI_MINIMAL_ABBREVIATION_FLOOR
      : undefined
  })

function handleClick() {
  accountStore.$patch({ subaccountId: props.subaccountId })
}
</script>

<template>
  <div
    class="rounded-2xl px-4 py-2 flex min-w-3xs cursor-pointer hover:bg-white/10"
    :class="{
      'bg-white/10': isSelectedSubaccountId
    }"
    @click="handleClick"
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
          hideBalances
            ? HIDDEN_BALANCE_DISPLAY
            : abbreviatedTotalBalanceToString
        }}
        USD
      </p>
    </div>
  </div>
</template>

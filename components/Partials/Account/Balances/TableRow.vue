<script lang="ts" setup>
import { PropType } from 'vue'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { AccountBalance, BridgeBusEvents, BusEvents, Modal } from '@/types'
import { usdcTokenDenom, usdcTokenDenoms } from '@/app/data/token'

const router = useRouter()
const spotStore = useSpotStore()
const modalStore = useModalStore()

const props = defineProps({
  expand: Boolean,
  hasOneUsdcBalance: Boolean,

  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  },

  hideBalances: {
    type: Boolean,
    required: true
  }
})

const isAggregateRow = !props.balance.token.denom

const isUsdcDenom =
  !isAggregateRow &&
  usdcTokenDenoms.includes(props.balance.token.denom.toLowerCase())

const convertUsdc = [usdcTokenDenom.USDC, usdcTokenDenom.USDCso].includes(
  props.balance.token.denom.toLowerCase()
)

const isOpen = ref(false)

const filteredMarkets = computed(() => {
  return spotStore.markets.filter(
    (m) =>
      (m.baseDenom === props.balance.token.denom ||
        m.quoteDenom === props.balance.token.denom) &&
      ![usdcTokenDenom.USDC, usdcTokenDenom.USDCso].includes(
        m.baseDenom.toLowerCase()
      )
  )
})

const { valueToString: totalBalanceInUsdToString } = useBigNumberFormatter(
  computed(() => props.balance.totalBalanceInUsd),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

/* TODO - bank <> default trading account merge

const { valueToString: availableBalanceToString } = useBigNumberFormatter(
  computed(() => props.balance.balanceToBase),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const {
  valueToBigNumber: totalBalanceInBigNumber,
  valueToString: totalBalanceInString
} = useBigNumberFormatter(
  computed(() => props.balance.totalBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
) */

const {
  valueToBigNumber: bankBalanceInBigNumber,
  valueToString: bankBalanceInString
} = useBigNumberFormatter(
  computed(() => props.balance.bankBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const {
  valueToBigNumber: subaccountBalanceInBigNumber,
  valueToString: subaccountBalanceInString
} = useBigNumberFormatter(
  computed(() => props.balance.subaccountBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const { valueToString: reservedBalanceToString } = useBigNumberFormatter(
  computed(() => props.balance.reservedBalance),
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

function handleNavigateToMarket(market: UiSpotMarketWithToken) {
  router.push({
    name: 'spot-spot',
    params: {
      spot: market.slug
    }
  })
}

function handleDepositClick() {
  useEventBus<Token | undefined>(BridgeBusEvents.Deposit).emit(
    props.balance.token
  )
}

function handleWithdrawClick() {
  useEventBus<Token | undefined>(BridgeBusEvents.Withdraw).emit(
    props.balance.token
  )
}

function handleConvert() {
  useEventBus<Token>(BusEvents.ConvertUSDC).emit(props.balance.token as Token)
  modalStore.openModal({ type: Modal.ConvertUSDC })
}
</script>

<template>
  <tr
    class="border-b border-gray-700 hover:bg-gray-700 bg-transparent px-4 py-0 overflow-hidden h-14 gap-2 transition-all"
    :class="{
      'last-of-type:border-b-transparent': !isUsdcDenom,
      'max-h-20': !isOpen,
      'max-h-screen': isOpen
    }"
    :data-cy="'wallet-balance-table-row-' + balance.token.symbol"
  >
    <td class="pl-4">
      <div
        class="flex justify-start items-center gap-2"
        :class="{ 'ml-8': isUsdcDenom && !hasOneUsdcBalance }"
      >
        <CommonTokenIcon
          v-if="!isUsdcDenom || hasOneUsdcBalance"
          :token="balance.token"
        />

        <div class="flex justify-start gap-2 items-center">
          <span
            class="text-white font-bold tracking-wide text-sm h-auto flex items-center"
            data-cy="wallet-balance-token-symbol-table-data"
          >
            {{ balance.token.symbol }}
          </span>

          <PartialsAccountBalancesUsdcLabel
            v-bind="{
              isUsdcDenom,
              balance
            }"
          />

          <BaseIcon
            v-if="isAggregateRow"
            name="caret-down"
            class="h-6 w-6 transition duration-500 hover:text-blue-500 -rotate-180"
            :class="{ 'rotate-0': !expand }"
          />
        </div>
      </div>
    </td>

    <!-- TODO - bank <> default trading account merge
    <td>
      <div class="flex justify-end" data-cy="wallet-balance-total-table-data">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span
          v-else-if="totalBalanceInBigNumber.gt(0)"
          class="font-mono text-sm text-right"
        >
          {{ totalBalanceInString }}
        </span>

        <span v-else> &mdash; </span>
      </div>
    </td>
    -->

    <td>
      <div class="flex justify-end" data-cy="wallet-balance-wallet-table-data">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span
          v-else-if="bankBalanceInBigNumber.gt(0)"
          class="font-mono text-sm text-right"
        >
          {{ bankBalanceInString }}
        </span>

        <span v-else> &mdash; </span>
      </div>
    </td>

    <td>
      <div
        class="flex justify-end"
        data-cy="wallet-balance-trading-account-table-data"
      >
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span
          v-else-if="subaccountBalanceInBigNumber.gt(0)"
          class="font-mono text-sm text-right"
        >
          {{ subaccountBalanceInString }}
        </span>

        <span v-else> &mdash; </span>
      </div>
    </td>

    <!-- TODO - bank <> default trading account merge
    <td>
      <div class="flex justify-end">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span v-else class="font-mono text-sm text-right">
          {{ availableBalanceToString }}
        </span>
      </div>
    </td>
    -->

    <td>
      <div class="flex justify-end">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <span v-else class="font-mono text-sm text-right">
          {{ reservedBalanceToString }}
        </span>
      </div>
    </td>

    <td>
      <div class="flex justify-end">
        <span v-if="hideBalances" class="font-mono text-sm text-right">
          {{ HIDDEN_BALANCE_DISPLAY }} USD
        </span>

        <span v-else class="font-mono text-sm text-right">
          {{ totalBalanceInUsdToString }} USD
        </span>
      </div>
    </td>

    <td class="pr-4">
      <div
        v-show="!isAggregateRow"
        class="flex items-center justify-end gap-4 col-start-2 col-span-2"
      >
        <div
          v-if="convertUsdc"
          class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
          data-cy="wallet-balance-convert"
          @click="handleConvert"
        >
          <span class="text-blue-500 text-sm font-medium">
            {{ $t('account.convertUsdc') }}
          </span>
        </div>
        <BaseDropdown
          v-if="filteredMarkets.length > 1 && !convertUsdc"
          popper-class="rounded-lg flex flex-col flex-wrap text-xs absolute w-36 bg-gray-750 shadow-dropdown"
        >
          <template #default>
            <div
              class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
            >
              <span class="text-blue-500 text-sm font-medium cursor-pointer">
                {{ $t('account.trade') }}
              </span>
            </div>
          </template>

          <template #content>
            <div class="flex flex-col py-2">
              <span
                v-for="market in filteredMarkets"
                :key="market.slug"
                class="px-4 py-2 font-semibold text-sm uppercase cursor-pointer text-white hover:text-blue-500"
                @click="handleNavigateToMarket(market)"
              >
                {{ market.baseToken.symbol }}/{{ market.quoteToken.symbol }}
              </span>
            </div>
          </template>
        </BaseDropdown>
        <div
          v-if="filteredMarkets.length === 1 && !convertUsdc"
          class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
          @click="handleNavigateToMarket(filteredMarkets[0])"
        >
          <span class="text-blue-500 text-sm font-medium cursor-pointer">
            {{ $t('account.trade') }}
          </span>
        </div>

        <div
          v-if="
            ![usdcTokenDenom.USDC].includes(balance.token.denom.toLowerCase())
          "
          class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
          data-cy="wallet-balance-deposit-link"
          @click="handleDepositClick"
        >
          <span class="text-blue-500 text-sm font-medium">
            {{ $t('account.deposit') }}
          </span>
        </div>

        <div
          v-if="
            ![usdcTokenDenom.USDC].includes(balance.token.denom.toLowerCase())
          "
          class="rounded flex items-center justify-center w-auto h-auto cursor-pointer"
          data-cy="wallet-balance-withdraw-link"
          @click="handleWithdrawClick"
        >
          <span class="text-blue-500 text-sm font-medium">
            {{ $t('account.withdraw') }}
          </span>
        </div>
      </div>
    </td>
  </tr>
</template>

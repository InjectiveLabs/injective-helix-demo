<script lang="ts" setup>
import { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import { UiPosition } from '@injectivelabs/sdk-ui-ts'
import { HIDDEN_BALANCE_DISPLAY } from '@/app/utils/constants'
import { getMarketRoute } from '@/app/utils/market'
import { BusEvents, Modal } from '@/types'

const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const modalStore = useModalStore()
const route = useRoute()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { error, success } = useNotifications()

const props = defineProps({
  isAccount: Boolean,
  hideBalance: Boolean,

  position: {
    required: true,
    type: Object as PropType<UiPosition>
  }
})

const emit = defineEmits<{
  (e: 'share:position', state: UiPosition): void
}>()

const {
  pnl,
  price,
  market,
  margin,
  quantity,
  markPrice,
  priceDecimals,
  percentagePnl,
  notionalValue,
  isBinaryOptions,
  liquidationPrice,
  quantityDecimals,
  effectiveLeverage
} = useDerivativePosition(computed(() => props.position))

const isBinaryOptionsPage = route.name === 'binary-options-binaryOption'
const status = reactive(new Status())

const reduceOnlyCurrentOrders = computed(() =>
  derivativeStore.subaccountOrders.filter(
    (order) => order.isReduceOnly && order.marketId === props.position.marketId
  )
)

const hasReduceOnlyOrders = computed(
  () => reduceOnlyCurrentOrders.value.length > 0
)

const marketRoute = computed(() => {
  if (!market.value) {
    return undefined
  }

  return getMarketRoute(market.value)
})

const rowWrapperClass = computed(() => {
  if (props.isAccount) {
    return 'border-b border-gray-600 last-of-type:border-b-transparent hover:bg-gray-700 bg-transparent px-4 py-0  h-14 gap-2 transition-all cursor-pointer'
  }

  return 'h-[60px]'
})

function onAddMarginButtonClick() {
  useEventBus<UiPosition>(BusEvents.AddMarginToPosition).emit(props.position)

  modalStore.openModal({ type: Modal.AddMarginToPosition })
}

function handleClosePosition() {
  if (!market.value) {
    return
  }

  if (pnl.value.isNaN()) {
    return error({ title: t('trade.no_liquidity') })
  }

  if (hasReduceOnlyOrders.value) {
    return closePositionAndReduceOnlyOrders()
  }

  closePosition()
}

function closePosition() {
  if (!market.value) {
    return
  }

  status.setLoading()

  positionStore
    .closePosition({
      position: props.position,
      market: market.value
    })
    .then(() => {
      success({ title: t('trade.position_closed') })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function closePositionAndReduceOnlyOrders() {
  if (!market.value) {
    return
  }

  status.setLoading()

  positionStore
    .closePositionAndReduceOnlyOrders({
      market: market.value,
      position: props.position,
      reduceOnlyOrders: reduceOnlyCurrentOrders.value
    })
    .then(() => {
      success({ title: t('trade.position_closed') })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function sharePosition() {
  emit('share:position', props.position)
}
</script>

<template>
  <tr
    v-if="market"
    :data-cy="'open-position-table-row-' + position.ticker"
    :class="rowWrapperClass"
    class="whitespace-nowrap"
  >
    <td class="text-left cursor-pointer pl-3" :class="{ 'pr-4': isAccount }">
      <NuxtLink class="flex items-center justify-start" :to="marketRoute">
        <div v-if="market.baseToken">
          <CommonTokenIcon :token="market.baseToken" />
        </div>
        <div class="ml-2">
          <span
            class="text-white text-xs"
            :class="{
              'font-bold lg:text-sm uppercase tracking-wide': isAccount
            }"
            data-cy="open-position-ticker-name-table-data"
          >
            {{ position.ticker }}
          </span>
        </div>
      </NuxtLink>
    </td>

    <td class="text-left pl-1 text-xs" :class="{ 'pr-4': isAccount }">
      <span
        data-cy="open-position-trade-direction-table-data"
        class="text-xs"
        :class="{
          'text-green-500': position.direction === TradeDirection.Long,
          'text-red-500': position.direction === TradeDirection.Short,
          'lg:text-sm': isAccount
        }"
      >
        {{
          position.direction === TradeDirection.Long
            ? $t('trade.long')
            : $t('trade.short')
        }}
      </span>
    </td>

    <td
      class="text-right font-mono text-white text-xs"
      :class="{ 'lg:text-sm pr-4': isAccount }"
    >
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <AppNumber
        v-else
        v-bind="{
          sm: isAccount,
          xs: !isAccount,
          decimals: quantityDecimals,
          number: quantity
        }"
        data-cy="open-position-quantity-table-data"
      />
    </td>

    <td
      class="text-right font-mono text-white text-xs"
      :class="{ 'pr-4': isAccount }"
    >
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <div v-else class="flex flex-col text-right">
        <AppNumber
          v-bind="{
            number: price,
            sm: isAccount,
            xs: !isAccount,
            decimals: priceDecimals
          }"
          data-cy="open-position-price-table-data"
        />
        <AppNumber
          v-bind="{
            number: markPrice,
            sm: isAccount,
            xs: !isAccount,
            decimals: priceDecimals
          }"
          class="text-gray-500 text-xs"
        />
      </div>
    </td>

    <td
      v-if="!isBinaryOptionsPage"
      class="text-right font-mono text-white text-xs"
      :class="{ 'lg:text-sm pr-4': isAccount }"
    >
      <span v-if="isBinaryOptions">&mdash;</span>
      <span v-else-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <AppNumber
        v-else
        v-bind="{
          number: liquidationPrice,
          sm: isAccount,
          xs: !isAccount,
          decimals: priceDecimals
        }"
        data-cy="open-position-liquidation-price-table-data"
      />
    </td>

    <td class="text-right" :class="{ 'pr-4': isAccount }">
      <span
        v-if="hideBalance"
        class="font-mono text-white text-xs"
        :class="{ 'lg:text-sm': isAccount }"
      >
        {{ HIDDEN_BALANCE_DISPLAY }}
      </span>
      <div
        v-else-if="!pnl.isNaN()"
        class="flex items-center justify-end font-medium text-xs font-mono"
        :class="{
          'text-green-500': pnl.gte(0),
          'text-red-500': pnl.lt(0),
          'lg:text-sm': isAccount
        }"
      >
        <div class="flex items-center space-x-2">
          <div class="flex items-end flex-col">
            <span class="flex items-center">
              <span class="mr-1">≈</span>
              <span>{{ pnl.gte(0) ? '+' : '' }}</span>
              <span
                data-cy="postion-entry-pnl"
                :class="{
                  'text-green-500': pnl.gte(0),
                  'text-red-500': pnl.lt(0)
                }"
              >
                {{ pnl.toFixed(2) }}
              </span>
              <span class="ml-1" :class="{ 'text-2xs': !isAccount }">{{
                market.quoteToken.symbol
              }}</span>
            </span>
            <span class="flex mt-1">
              {{
                (percentagePnl.gte(0) ? '+' : '') + percentagePnl.toFormat(2)
              }}%
            </span>
          </div>

          <BaseIcon
            name="share"
            class="text-gray-500 hover:text-gray-400 w-4 h-4 min-w-4"
            @click="sharePosition"
          />
        </div>
      </div>
      <span
        v-else
        class="text-white text-xs"
        :class="{ 'lg:text-sm': isAccount }"
        data-cy="open-position-no-pnl-table-data"
      >
        {{ $t('trade.not_available_n_a') }}
      </span>
    </td>

    <td
      class="text-right font-mono text-white text-xs"
      :class="{ 'lg:text-sm pr-6': isAccount }"
    >
      <span v-if="hideBalance">
        {{ HIDDEN_BALANCE_DISPLAY }}
      </span>

      <AppNumber
        v-else
        v-bind="{
          number: notionalValue,
          sm: isAccount,
          xs: !isAccount,
          decimals: priceDecimals
        }"
        data-cy="open-position-total-table-data"
      >
        <template #addon>
          <span
            class="text-2xs text-gray-500"
            :class="{ 'text-xs lg:text-sm text-gray-450 uppercase': isAccount }"
          >
            {{ market.quoteToken.symbol }}
          </span>
        </template>
      </AppNumber>
    </td>

    <td
      class="text-right font-mono text-white text-xs"
      :class="{ 'lg:text-sm pr-4': isAccount }"
    >
      <span v-if="hideBalance">
        {{ HIDDEN_BALANCE_DISPLAY }}
      </span>
      <div v-else class="flex items-center justify-end">
        <AppNumber
          v-bind="{
            number: margin,
            sm: isAccount,
            xs: !isAccount,
            decimals: priceDecimals
          }"
          data-cy="open-position-margin-table-data"
          :decimals="priceDecimals"
          :number="margin"
        />

        <div
          v-if="!isBinaryOptions"
          class="cursor-pointer flex items-center justify-center rounded-full bg-opacity-10 hover:bg-opacity-30 hover:text-blue-500 text-gray-500 min-w-4 w-4 h-4 border border-gray-500 hover:border-blue-500 ml-1"
          @click.stop="onAddMarginButtonClick"
        >
          <BaseIcon name="plus" xs />
        </div>
      </div>
    </td>

    <td
      v-if="!isBinaryOptionsPage"
      class="text-right text-white text-xs font-mono"
      :class="{ 'lg:text-sm pr-4': isAccount }"
    >
      <span v-if="isBinaryOptions">&mdash;</span>

      <span v-else-if="hideBalance">
        {{ HIDDEN_BALANCE_DISPLAY }}
      </span>
      <span
        v-else-if="effectiveLeverage.gte(0)"
        class="flex items-center justify-end"
        data-cy="open-position-leverage-table-data"
      >
        {{ effectiveLeverage.toFormat(2) }}
        <span class="text-gray-300">&times;</span>
      </span>
      <span
        v-else
        class="text-gray-500 text-xs"
        data-cy="open-position-no-leverage-table-data"
      >
        {{ $t('trade.not_available_n_a') }}
      </span>
    </td>

    <td class="text-center relative" :class="{ 'pl-6': isAccount }">
      <PartialsCommonCancelButton
        v-if="!hideBalance"
        :status="status"
        data-cy="open-position-cancel-link"
        @click="handleClosePosition"
      >
        <template #icon>
          <BaseIcon name="close" sm />
        </template>
      </PartialsCommonCancelButton>
    </td>
  </tr>
</template>

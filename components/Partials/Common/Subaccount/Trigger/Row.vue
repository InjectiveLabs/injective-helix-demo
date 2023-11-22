<script lang="ts" setup>
import { Status } from '@injectivelabs/utils'
import { UiDerivativeOrderHistory } from '@injectivelabs/sdk-ui-ts'
import { getMarketRoute } from '@/app/utils/market'
import { TradeSubPage } from '@/types'

const derivativeStore = useDerivativeStore()
const route = useRoute()
const { $onError } = useNuxtApp()
const { t } = useLang()
const { success } = useNotifications()

const props = defineProps({
  trigger: {
    required: true,
    type: Object as PropType<UiDerivativeOrderHistory>
  }
})

const isBinaryOptionsPage = route.name === TradeSubPage.BinaryOption

const status = reactive(new Status())

const {
  type,
  isBuy,
  total,
  price,
  market,
  quantity,
  leverage,
  isStopLoss,
  isReduceOnly,
  isCancelable,
  triggerPrice,
  isTakeProfit,
  isMarketOrder,
  priceDecimals,
  quantityDecimals
} = useTrigger(computed(() => props.trigger))

const marketRoute = computed(() => {
  if (!market.value) {
    return undefined
  }

  return getMarketRoute(market.value)
})

function cancelOrder(): void {
  status.setLoading()

  derivativeStore
    .cancelOrder(props.trigger)
    .then(() => {
      success({ title: t('trade.order_success_canceling') })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <tr
    v-if="market"
    :data-cy="'derivative-order-table-row-' + market.ticker"
    :data-cy-hash="trigger.orderHash"
  >
    <td class="text-left cursor-pointer pl-3">
      <NuxtLink class="flex items-center justify-start" :to="marketRoute">
        <div v-if="market.baseToken" class="w-4 h-4">
          <CommonTokenIcon :token="market.baseToken" is-sm />
        </div>

        <div class="ml-3">
          <span
            class="text-gray-200 text-xs"
            data-cy="derivative-order-ticker-name-table-data"
          >
            {{ market.ticker }}
          </span>
        </div>
      </NuxtLink>
    </td>

    <td class="text-left">
      <span class="text-white text-xs">
        {{ type }}
      </span>
    </td>

    <td class="text-left">
      <span
        data-cy="derivative-order-order-side-table-data"
        class="text-xs"
        :class="{
          'text-green-500': isBuy,
          'text-red-500': !isBuy
        }"
      >
        {{ isBuy ? $t('trade.buy') : $t('trade.sell') }}
      </span>
      <span
        v-if="isReduceOnly"
        class="ml-0.5 text-xs text-gray-500"
        data-cy="derivative-order-reduce-only-table-data"
      >
        {{ $t('trade.reduce_only') }}
      </span>
    </td>

    <td class="font-mono text-right">
      <span v-if="isMarketOrder" class="text-white text-xs">
        {{ $t('trade.market') }}
      </span>

      <AppNumber
        v-else
        is-xs
        data-cy="derivative-order-price-table-data"
        :decimals="priceDecimals"
        :number="price"
      />
    </td>

    <td class="text-right font-mono">
      <AppNumber
        is-xs
        data-cy="derivative-order-quantity-table-data"
        :decimals="quantityDecimals"
        :number="quantity"
      />
    </td>

    <td v-if="!isBinaryOptionsPage" class="text-right font-mono">
      <span
        v-if="leverage.gte(0)"
        class="flex items-center justify-end text-xs"
        data-cy="derivative-order-leverage-table-data"
      >
        {{ leverage.toFormat(2) }}
        <span class="text-gray-300">&times;</span>
      </span>
      <span
        v-else
        class="text-gray-400 text-xs"
        data-cy="derivative-order-no-leverage-table-data"
      >
        {{ $t('trade.not_available_n_a') }}
      </span>
    </td>

    <td class="text-right font-mono">
      <AppNumber
        is-xs
        data-cy="derivative-order-filled-quantity-table-data"
        :decimals="quantityDecimals"
        :number="total"
      >
        <template #addon>
          <span class="text-xs text-gray-500">
            {{ market.quoteToken.symbol }}
          </span>
        </template>
      </AppNumber>
    </td>

    <td>
      <div class="flex items-center justify-end gap-1">
        <span class="text-gray-500 text-xs font-semibold">
          {{ $t('trade.mark_price') }}
        </span>

        <span
          v-if="(isStopLoss && !isBuy) || (isTakeProfit && isBuy)"
          class="text-white text-xs font-semibold"
        >
          &le;
        </span>
        <span v-else class="text-white text-xs font-semibold"> &ge; </span>

        <AppNumber
          is-xs
          data-cy="derivative-order-total-table-data"
          :decimals="priceDecimals"
          :number="triggerPrice"
        />
      </div>
    </td>

    <td class="relative text-right pr-3">
      <div class="flex items-center justify-end">
        <NuxtLink
          v-if="false"
          class="cursor-pointer text-blue-500 mr-6"
          data-cy="derivative-order-view-link"
          :to="marketRoute"
        >
          {{ $t('common.view') }}
        </NuxtLink>

        <PartialsCommonCancelButton
          v-if="isCancelable"
          :status="status"
          data-cy="derivative-order-cancel-link"
          @click="cancelOrder"
        />
        <span v-else class="inline-block">&mdash;</span>
      </div>
    </td>
  </tr>
</template>

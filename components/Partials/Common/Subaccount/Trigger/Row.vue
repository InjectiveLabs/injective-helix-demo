<script lang="ts" setup>
import { PropType } from 'vue'
import { UiDerivativeOrderHistory } from '@injectivelabs/sdk-ui-ts'
import { Status } from '@injectivelabs/utils'
import { getMarketRoute } from '@/app/utils/market'

const derivativeStore = useDerivativeStore()
const route = useRoute()
const router = useRouter()
const { $onError } = useNuxtApp()
const { t } = useLang()
const { success } = useNotifications()

const props = defineProps({
  trigger: {
    required: true,
    type: Object as PropType<UiDerivativeOrderHistory>
  }
})

const status = reactive(new Status())

const isBinaryOptionsPage = route.name === 'binary-options-binaryOption'

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

function onCancelOrder(): void {
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

function handleClickOnMarket() {
  if (!market.value) {
    return
  }

  return router.push(getMarketRoute(market.value))
}
</script>

<template>
  <tr
    v-if="market"
    :data-cy="'derivative-order-table-row-' + market.ticker"
    :data-cy-hash="trigger.orderHash"
  >
    <td class="h-12 text-left cursor-pointer pl-3" @click="handleClickOnMarket">
      <div class="flex items-center justify-start">
        <div v-if="market.baseToken" class="w-4 h-4">
          <CommonTokenIcon :token="market.baseToken" sm />
        </div>

        <div class="ml-3">
          <span
            class="text-gray-200 text-xs"
            data-cy="derivative-order-ticker-name-table-data"
          >
            {{ market.ticker }}
          </span>
        </div>
      </div>
    </td>

    <td class="h-12 text-left">
      <span class="text-white text-xs">
        {{ type }}
      </span>
    </td>

    <td class="h-12 text-left">
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

    <td class="h-12 font-mono text-right">
      <span v-if="isMarketOrder" class="text-white text-xs">
        {{ $t('trade.market') }}
      </span>

      <AppNumber
        v-else
        xs
        data-cy="derivative-order-price-table-data"
        :decimals="priceDecimals"
        :number="price"
      />
    </td>

    <td class="h-12 text-right font-mono">
      <AppNumber
        xs
        data-cy="derivative-order-quantity-table-data"
        :decimals="quantityDecimals"
        :number="quantity"
      />
    </td>

    <td v-if="!isBinaryOptionsPage" class="h-12 text-right font-mono">
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

    <td class="h-12 text-right font-mono">
      <AppNumber
        xs
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

    <td class="h-12 flex items-center justify-end gap-1">
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
        xs
        data-cy="derivative-order-total-table-data"
        :decimals="priceDecimals"
        :number="triggerPrice"
      />
    </td>

    <td class="h-12 relative text-right pr-3">
      <div class="flex items-center justify-end">
        <span
          v-if="false"
          class="cursor-pointer text-blue-500 mr-6"
          data-cy="derivative-order-view-link"
          @click="handleClickOnMarket"
        >
          {{ $t('common.view') }}
        </span>

        <PartialsTradingFormCancelButton
          v-if="isCancelable"
          :status="status"
          data-cy="derivative-order-cancel-link"
          @click="onCancelOrder"
        />
        <span v-else class="inline-block">&mdash;</span>
      </div>
    </td>
  </tr>
</template>

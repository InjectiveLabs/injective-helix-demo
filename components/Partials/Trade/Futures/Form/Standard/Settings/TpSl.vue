<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  MarketKey,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'
import type { UiDerivativeMarket, DerivativesTradeForm } from '@/types'

const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const positionStore = usePositionStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()
const { markPrice } = useDerivativeLastPrice(market)

const emit = defineEmits<{
  'tpsl:add': [position: PositionV2]
}>()

const props = withDefaults(
  defineProps<{
    estLiquidationPrice: BigNumberInBase
  }>(),
  {}
)

const isBuy = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long
)

const { value: isTpSlEnabled } = useBooleanField({
  name: DerivativesTradeFormField.isTpSlEnabled,
  initialValue: false,
  rule: ''
})

const { value: takeProfitValue, errorMessage: takeProfitErrorMessage } =
  useStringField({
    name: DerivativesTradeFormField.TakeProfit,
    initialValue: '',
    rule: '',
    dynamicRule: computed(() => {
      const formattedMarkPrice = new BigNumberInBase(markPrice.value).toFixed(
        market.value.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )

      if (isBuy.value) {
        return `minValue:${formattedMarkPrice}`
      } else {
        return `maxValue:${formattedMarkPrice}`
      }
    })
  })

const { value: stopLossValue, errorMessage: stopLossErrorMessage } =
  useStringField({
    name: DerivativesTradeFormField.StopLoss,
    initialValue: '',
    rule: '',
    dynamicRule: computed(() => {
      const formattedMarkPrice = new BigNumberInBase(markPrice.value).toFixed(
        market.value.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )
      const formattedEstLiquidationPrice = props.estLiquidationPrice.toFixed(
        market.value.priceDecimals || UI_DEFAULT_MIN_DISPLAY_DECIMALS,
        BigNumberInBase.ROUND_DOWN
      )

      if (isBuy.value) {
        const minValueRule = `minValue:${formattedEstLiquidationPrice}`
        const maxValueRule = `maxValue:${formattedMarkPrice}`

        return [minValueRule, maxValueRule].join('|')
      } else {
        const minValueRule = `minValue:${formattedMarkPrice}`
        const maxValueRule = `maxValue:${formattedEstLiquidationPrice}`

        return [minValueRule, maxValueRule].join('|')
      }
    })
  })

const currentMarketPosition = computed(() =>
  positionStore.subaccountPositions.find(
    (position) => position.marketId === market.value.marketId
  )
)

function addTpSl() {
  if (currentMarketPosition.value) {
    emit('tpsl:add', currentMarketPosition.value)
  }
}
</script>

<template>
  <div class="border-t mt-2">
    <div v-if="currentMarketPosition" class="pt-2">
      <button
        class="flex items-center p-2 focus-visible:outline-none"
        :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlAddButton)"
        @click="addTpSl"
      >
        <div class="flex rounded-full transition hover:bg-coolGray-600">
          <UIcon class="h-6 w-6 min-w-6" :name="NuxtUiIcons.CirclePlus" />
        </div>

        <span class="ml-2 text-xs">{{ $t('trade.tpSl') }}</span>
      </button>
    </div>

    <div v-else>
      <div class="py-2">
        <AppCheckbox
          v-model="isTpSlEnabled"
          class="text-white"
          :data-cy="dataCyTag(PerpetualMarketCyTags.TpSlCheckbox)"
        >
          {{ $t('trade.tpSl') }}
        </AppCheckbox>
      </div>

      <div v-if="isTpSlEnabled" class="space-y-2 p-1">
        <div class="space-y-2">
          <AppInputField
            v-model="takeProfitValue"
            :placeholder="$t('trade.takeProfit')"
            class="placeholder:font-sans"
            :data-cy="dataCyTag(PerpetualMarketCyTags.TakeProfitInputField)"
          />

          <p v-if="takeProfitErrorMessage" class="error-message">
            {{ takeProfitErrorMessage }}
          </p>
        </div>

        <div class="space-y-2">
          <AppInputField
            v-model="stopLossValue"
            :placeholder="$t('trade.stopLoss')"
            class="placeholder:font-sans"
            :data-cy="dataCyTag(PerpetualMarketCyTags.StopLossInputField)"
          />

          <p v-if="stopLossErrorMessage" class="error-message">
            {{ stopLossErrorMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

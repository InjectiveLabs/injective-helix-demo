<script lang="ts" setup>
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { UiSpotMarket, SpotGridTradingField } from '@/types'

const setFormValues = useSetFormValues()

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarket>,
    required: true
  },

  upperPrice: {
    type: String,
    required: true
  },

  lowerPrice: {
    type: String,
    required: true
  },

  grids: {
    type: String,
    required: true
  },

  decimalPlaces: {
    type: Number,
    default: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
})

const isOpen = ref(false)

const { lastTradedPrice } = useSpotLastPrice(computed(() => props.market))

const { valueToString: upperPriceToString } = useSharedBigNumberFormatter(
  computed(() => props.upperPrice),
  { decimalPlaces: props.decimalPlaces, displayAbsoluteDecimalPlace: true }
)

const { valueToString: lowerPriceToString } = useSharedBigNumberFormatter(
  computed(() => props.lowerPrice),
  { decimalPlaces: props.decimalPlaces, displayAbsoluteDecimalPlace: true }
)

const { valueToString: currentPriceToString } = useSharedBigNumberFormatter(
  lastTradedPrice,
  { decimalPlaces: props.decimalPlaces, displayAbsoluteDecimalPlace: true }
)

onMounted(() => {
  setFormValues(
    {
      [SpotGridTradingField.UpperPrice]: '',
      [SpotGridTradingField.LowerPrice]: '',
      [SpotGridTradingField.Grids]: ''
    },
    false
  )
})

function toggleAdvancedSettings() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div>
    <div
      class="flex justify-between items-center select-none"
      @click="toggleAdvancedSettings"
    >
      <p class="font-semibold text-sm">
        {{ $t('liquidity.parametersForAdvancedStrategy') }}
      </p>
      <div
        class="transition-all duration-300"
        :class="{ 'rotate-180': isOpen }"
      >
        <SharedIcon name="chevron-down" is-md />
      </div>
    </div>

    <div v-if="isOpen" class="space-y-2 my-4 text-sm">
      <div class="flex justify-between">
        <p>{{ $t('sgt.numberOfGrids') }}</p>
        <p>{{ props.grids }}</p>
      </div>
      <div class="flex justify-between">
        <p>{{ $t('sgt.lowerPrice') }}</p>
        <p>{{ lowerPriceToString }}</p>
      </div>
      <div class="flex justify-between">
        <p>{{ $t('sgt.upperPrice') }}</p>
        <p>{{ upperPriceToString }}</p>
      </div>
      <div class="flex justify-between">
        <p>{{ $t('sgt.currentPrice') }}</p>
        <p>{{ currentPriceToString }}</p>
      </div>
    </div>
  </div>
</template>

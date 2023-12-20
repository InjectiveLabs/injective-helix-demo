<script lang="ts" setup>
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { getExactDecimalsFromNumber } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'

const slots = useSlots()

const props = defineProps({
  isSm: Boolean,
  isXs: Boolean,
  isFlex: Boolean,
  isDense: Boolean,
  isNoGrouping: Boolean,
  useNumberDecimals: Boolean,

  prefix: {
    type: String,
    default: ''
  },

  suffix: {
    type: String,
    default: ''
  },

  number: {
    required: false,
    default: new BigNumberInBase(0),
    type: Object as PropType<BigNumberInBase>
  },

  numberString: {
    required: false,
    default: '',
    type: String
  },

  decimals: {
    type: Number,
    default: UI_DEFAULT_DISPLAY_DECIMALS
  },

  roundingMode: {
    type: Number as PropType<BigNumber.RoundingMode>,
    default: BigNumberInBase.ROUND_DOWN
  },

  abbreviationFloor: {
    type: Number,
    default: 0
  }
})

const actualNumber = computed(
  () => new BigNumberInBase(props.numberString || props.number)
)

const actualDecimals = computed(() =>
  props.useNumberDecimals
    ? getExactDecimalsFromNumber(actualNumber.value.toNumber())
    : props.decimals
)

const { valueToString: formattedNumberToString } = useBigNumberFormatter(
  computed(() => actualNumber.value),
  {
    abbreviationFloor: props.abbreviationFloor,
    decimalPlaces: actualDecimals.value,
    roundingMode: props.roundingMode,
    displayAbsoluteDecimalPlace: true
  }
)

const formattedNumber = computed(() => {
  if (actualNumber.value.eq(0)) {
    return ['0.00']
  }

  if (props.isNoGrouping) {
    return [formattedNumberToString.value]
  }

  const match = formattedNumberToString.value.match(
    /^(-?[\d,]+)((\.)(\d+?\d+?)(0*))?$/
  )
  const groups = !match
    ? formattedNumberToString.value
      ? [formattedNumberToString.value]
      : []
    : match[2]
    ? [`${match[1]}${match[3]}${match[4]}`, match[5]]
    : [`${match[1]}`]

  return groups
})
</script>

<template>
  <div :class="{ 'flex justify-start items-center gap-1': isFlex }">
    <span
      class="font-mono"
      :class="{
        'text-xs': isXs,
        'text-sm': isSm,
        'inline-block': !isFlex,
        'flex items-center': isFlex
      }"
    >
      <div class="flex" :class="{ 'mr-1': slots.addon }">
        <span class="">{{ prefix || '' }}{{ formattedNumber[0] }}</span>
        <span v-if="formattedNumber[1]" class="opacity-25">
          {{ formattedNumber[1] || '' }}
        </span>
        <span v-if="suffix" class="ml-1">{{ suffix || '' }}</span>
      </div>
    </span>

    <slot name="addon"></slot>
  </div>
</template>

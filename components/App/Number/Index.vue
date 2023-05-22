<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { getExactDecimalsFromNumber } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'

const slots = useSlots()

const props = defineProps({
  sm: Boolean,
  xs: Boolean,
  flex: Boolean,
  dense: Boolean,
  noGrouping: Boolean,
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
    required: true,
    type: Object as PropType<BigNumberInBase>
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

const actualDecimals = computed(() =>
  props.useNumberDecimals
    ? getExactDecimalsFromNumber(props.number.toNumber())
    : props.decimals
)

const { valueToString: formattedNumberToString } = useBigNumberFormatter(
  computed(() => props.number),
  {
    abbreviationFloor: props.abbreviationFloor,
    decimalPlaces: actualDecimals.value,
    roundingMode: props.roundingMode,
    displayAbsoluteDecimalPlace: true
  }
)

const formattedNumber = computed(() => {
  if (props.number.eq(0)) {
    return ['0.00']
  }

  if (props.noGrouping) {
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
  <div :class="{ 'flex justify-start items-center gap-1': flex }">
    <span
      class="font-mono"
      :class="{
        'text-xs': xs,
        'text-sm': sm,
        'inline-block': !flex,
        'flex items-center': flex
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

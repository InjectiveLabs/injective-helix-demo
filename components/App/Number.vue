<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { getExactDecimalsFromNumber } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'

const slots = useSlots()

const props = defineProps({
  dense: Boolean,
  flex: Boolean,
  sm: Boolean,
  xs: Boolean,

  decimals: {
    required: false,
    default: UI_DEFAULT_DISPLAY_DECIMALS,
    type: Number
  },

  useNumberDecimals: {
    required: false,
    default: false,
    type: Boolean
  },

  abbreviationFloor: {
    required: false,
    default: 0,
    type: Number
  },

  prefix: {
    required: false,
    type: String,
    default: ''
  },

  suffix: {
    required: false,
    type: String,
    default: ''
  },

  number: {
    required: true,
    type: Object as PropType<BigNumberInBase>
  },

  dontGroupValues: {
    required: false,
    default: false,
    type: Boolean
  },

  roundingMode: {
    type: Number as PropType<BigNumber.RoundingMode>,
    default: BigNumberInBase.ROUND_DOWN
  }
})

const formattedNumber = computed(() => {
  if (props.number.eq(0)) {
    return ['0.00']
  }

  const actualDecimals = props.useNumberDecimals
    ? getExactDecimalsFromNumber(props.number.toNumber())
    : props.decimals

  const { valueToString: formattedNumber } = useBigNumberFormatter(
    computed(() => props.number),
    {
      abbreviationFloor: props.abbreviationFloor,
      decimalPlaces: actualDecimals,
      roundingMode: props.roundingMode,
      displayAbsoluteDecimalPlace: true
    }
  )

  if (props.dontGroupValues) {
    return [formattedNumber.value]
  }

  const match = formattedNumber.value.match(/^(-?[\d,]+)((\.)(\d+?\d+?)(0*))?$/)
  const groups = !match
    ? formattedNumber.value
      ? [formattedNumber.value]
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

<script lang="ts" setup>
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { getExactDecimalsFromNumber } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'

const slots = useSlots()

const props = withDefaults(
  defineProps<{
    isSm?: boolean
    isXs?: boolean
    isFlex?: boolean
    isDense?: boolean
    isNoGrouping?: boolean
    useNumberDecimals?: boolean

    prefix?: string
    suffix?: string
    number?: BigNumberInBase
    numberString?: string
    decimals?: number
    roundingMode?: BigNumber.RoundingMode
    abbreviationFloor?: number
  }>(),
  {
    isSm: false,
    isXs: false,
    isFlex: false,
    prefix: '',
    suffix: '',
    number: () => new BigNumberInBase(0),
    isDense: false,
    decimals: UI_DEFAULT_DISPLAY_DECIMALS,
    numberString: '',
    isNoGrouping: false,
    roundingMode: BigNumberInBase.ROUND_DOWN,
    useNumberDecimals: false,
    abbreviationFloor: 0
  }
)

const actualNumber = computed(
  () => new BigNumberInBase(props.numberString || props.number)
)

const actualDecimals = computed(() =>
  props.useNumberDecimals
    ? getExactDecimalsFromNumber(actualNumber.value.toNumber())
    : props.decimals
)

const { valueToString: formattedNumberToString } = useSharedBigNumberFormatter(
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

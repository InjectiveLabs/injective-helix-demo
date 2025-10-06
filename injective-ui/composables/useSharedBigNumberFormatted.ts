import {
  BigNumber,
  BigNumberInBase,
  getExactDecimalsFromNumber
} from '@injectivelabs/utils'
import { abbreviateNumber } from '../utils/helper'

const ZERO_IN_BASE = new BigNumberInBase(0)
const DEFAULT_DECIMAL_PLACES = 2
const DEFAULT_MINIMAL_DISPLAY_DECIMAL_PLACES = 4
const DEFAULT_MAX_MINIMAL_DISPLAY_DECIMAL_PLACES = 12
const DEFAULT_INJ_FEE = 0.005
const DEFAULT_ROUNDING_MODE = BigNumberInBase.ROUND_DOWN

const getFormattedZeroValue = (decimalPlaces: number) => {
  if (decimalPlaces > 0) {
    return `0.${'0'.repeat(decimalPlaces)}`
  }

  return '0.0'
}

const getNumberMinimalDecimals = (
  value: Ref<BigNumberInBase>,
  defaultMinimalDecimalPlaces?: number,
  displayAbsoluteDecimalPlace?: boolean
) => {
  const valueExactDecimals = getExactDecimalsFromNumber(value.value.toFixed())
  const minimalDecimalPlaces =
    defaultMinimalDecimalPlaces ?? DEFAULT_MINIMAL_DISPLAY_DECIMAL_PLACES
  const minNumberFromDefaultMinDecimals = new BigNumberInBase(1).shiftedBy(
    -minimalDecimalPlaces
  )

  if (value.value.eq(0)) {
    return {
      minimalDecimalPlaces: 2,
      minimalDisplayAmount: ZERO_IN_BASE
    }
  }

  /**
   * The number is less then the range of minimal decimals,
   * for example if minimalDecimalPlaces = 4, the number is
   * smaller than 0.0001
   * show exact decimal places the based on the value provided up to 12 decimal places
   * i.e a value with 0.000001010102 will be displayed as < 0.000001
   */
  if (
    value.value.lte(minNumberFromDefaultMinDecimals) &&
    displayAbsoluteDecimalPlace
  ) {
    const actualMinimalDecimalPlaces =
      valueExactDecimals > DEFAULT_MAX_MINIMAL_DISPLAY_DECIMAL_PLACES
        ? DEFAULT_MAX_MINIMAL_DISPLAY_DECIMAL_PLACES
        : valueExactDecimals
    const minimalDisplayAmount = new BigNumber(1).shiftedBy(
      -actualMinimalDecimalPlaces
    )

    /**
     * Go up to 12 decimals if needed, which is a maximum we can support
     * at this point
     */
    return {
      minimalDisplayAmount,
      minimalDecimalPlaces: actualMinimalDecimalPlaces
    }
  }

  /*
   * display the value based on the minimalDecimalPlaces value provided
   * which is default to 4, if not provided
   * for example minimalDecimalPlaces: 3 will show <0.01 if value is less then 0.01
   */
  return {
    minimalDecimalPlaces,
    minimalDisplayAmount: new BigNumber(1).shiftedBy(-minimalDecimalPlaces)
  }
}

export function useSharedBigNumberFormatter(
  value: ComputedRef<string | Number | BigNumberInBase>,
  options: {
    decimalPlaces?: number | ComputedRef<number | undefined>
    minimalDecimalPlaces?: number | ComputedRef<number | undefined>
    abbreviationFloor?: number /** Wether we should abbreviate numbers, for example 1,234,455 => 1M */
    injFee?: number
    roundingMode?: BigNumber.RoundingMode
    displayAbsoluteDecimalPlace?: boolean /** Explained above */
    shouldTruncate?: Boolean
  } = {}
) {
  const valueToBigNumber = computed(() => {
    if (!value.value) {
      return new BigNumberInBase(0)
    }

    if (BigNumber.isBigNumber(value.value)) {
      return value.value
    }

    return new BigNumberInBase(value.value as string)
  })

  const roundingMode = options.roundingMode || DEFAULT_ROUNDING_MODE
  const decimalPlaces = computed(
    () => toValue(options.decimalPlaces) ?? DEFAULT_DECIMAL_PLACES
  )
  const injFee = options.injFee ?? DEFAULT_INJ_FEE
  const displayAbsoluteDecimalPlace = !!options.displayAbsoluteDecimalPlace

  const valueToFixed = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.isZero()) {
      return options.shouldTruncate
        ? '0'
        : getFormattedZeroValue(decimalPlaces.value)
    }

    if (
      !!options.abbreviationFloor &&
      valueToBigNumber.value.gte(options.abbreviationFloor)
    ) {
      return abbreviateNumber(valueToBigNumber.value.toNumber())
    }

    const roundedValue = valueToBigNumber.value.toFixed(
      decimalPlaces.value,
      roundingMode
    )

    if (options.shouldTruncate) {
      return new BigNumberInBase(roundedValue).toFixed()
    }

    return roundedValue
  })

  const valueToString = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.isZero()) {
      return options.shouldTruncate
        ? '0'
        : getFormattedZeroValue(decimalPlaces.value)
    }

    if (
      !!options.abbreviationFloor &&
      valueToBigNumber.value.gte(options.abbreviationFloor)
    ) {
      return abbreviateNumber(valueToBigNumber.value.toNumber())
    }

    const { minimalDecimalPlaces, minimalDisplayAmount } =
      getNumberMinimalDecimals(
        valueToBigNumber,
        toValue(options.minimalDecimalPlaces),
        displayAbsoluteDecimalPlace
      )

    const roundedValue = valueToBigNumber.value.toFixed(
      decimalPlaces.value,
      roundingMode
    )

    if (options.shouldTruncate) {
      return new BigNumberInBase(roundedValue).toFormat()
    }

    if (valueToBigNumber.value.abs().lt(minimalDisplayAmount)) {
      return `< ${minimalDisplayAmount.toFormat(minimalDecimalPlaces)}`
    }

    return new BigNumberInBase(roundedValue).toFormat(decimalPlaces.value)
  })

  const valueWithGasBuffer = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.lte(injFee)) {
      return new BigNumberInBase(0)
    }

    return valueToBigNumber.value.minus(injFee)
  })

  const valueWithGasBufferToFixed = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.isZero()) {
      return getFormattedZeroValue(decimalPlaces.value)
    }

    return valueWithGasBuffer.value.toFixed(decimalPlaces.value, roundingMode)
  })

  const valueWithGasBufferToString = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.isZero()) {
      return getFormattedZeroValue(decimalPlaces.value)
    }

    if (
      !!options.abbreviationFloor &&
      valueToBigNumber.value.gte(options.abbreviationFloor)
    ) {
      return abbreviateNumber(valueToBigNumber.value.toNumber())
    }

    const { minimalDecimalPlaces, minimalDisplayAmount } =
      getNumberMinimalDecimals(
        valueToBigNumber,
        toValue(options.minimalDecimalPlaces),
        displayAbsoluteDecimalPlace
      )

    if (valueWithGasBuffer.value.abs().lt(minimalDisplayAmount)) {
      return `< ${minimalDisplayAmount.toFormat(minimalDecimalPlaces)}`
    }

    return valueWithGasBuffer.value.toFormat(decimalPlaces.value, roundingMode)
  })

  return {
    valueToFixed,
    valueToString,
    valueToBigNumber,
    valueWithGasBuffer,
    valueWithGasBufferToFixed,
    valueWithGasBufferToString
  }
}

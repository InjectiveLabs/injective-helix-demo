import { defineNuxtPlugin } from '#app'
import { Network } from '@shared/types'
import { defineRule } from 'vee-validate'
import { NUMBER_REGEX } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { getEthereumAddress } from '@injectivelabs/sdk-ts'
import { defineTradeRules } from '@/app/client/utils/validation/trade'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { SpotGridTradingField } from '@/types'

const formatFieldName = (value: string) => {
  // Insert a space before all found uppercase letters in the string and trim the resulting string
  let result = value.replace(/([A-Z])/g, ' $1').trim()

  // Capitalize the first letter and join it with the rest of the string
  result = result.charAt(0).toUpperCase() + result.slice(1)

  return result
}

export const errorMessages = {
  email: () => 'This field should be a valid email',
  injAddress: () => 'This field is not a valid Injective address',
  positiveNumber: () => 'This field is not a valid number',
  integer: (fieldName: string) => `${fieldName} must be > 0`,
  fixedLength: (length: string) =>
    `This field must be exactly ${length} characters long.`,

  [Network.Axelar]: () => 'This field is not a valid Cosmos address',
  [Network.CosmosHub]: () => 'This field is not a valid Cosmos address',
  [Network.Ethereum]: () => 'This field is not a valid Ethereum address',
  [Network.Evmos]: () => 'This field is not a valid Evmos address',
  // [Network.Moonbeam]: () => 'This field is not a valid Moonbeam address',
  [Network.Injective]: () => 'This field is not a valid Injective address',
  [Network.Osmosis]: () => 'This field is not a valid Osmosis address',
  [Network.Persistence]: () => 'This field is not a valid Persistence address',
  [Network.Secret]: () => 'This field is not a valid Secret Network address',
  [Network.Noble]: () => 'This field is not a valid Noble Network address',
  [Network.Stride]: () => 'This field is not a valid Stride address',
  [Network.Crescent]: () => 'This field is not a valid Crescent address',
  [Network.Sommelier]: () => 'This field is not a valid Sommelier address',
  [Network.Canto]: () => 'This field is not a valid Canto address',
  [Network.Kava]: () => 'This field is not a valid Kava address',
  [Network.Oraichain]: () => 'This field is not a valid Oraichain address',
  [Network.Migaloo]: () => 'This field is not a valid Migaloo address',
  [Network.Celestia]: () => 'This field is not a valid Celestia address'
} as Record<string, (_field?: string, _params?: Record<string, any>) => string>

export const defineGlobalRules = () => {
  defineRule('email', (value: string) => {
    const validEmailPattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if (!validEmailPattern.test(value)) {
      return errorMessages.email()
    }

    return true
  })

  defineRule('between', (value: string, [min, max]: string[]) => {
    const valueIsOutOfBounds =
      Number(min) > Number(value) || Number(max) < Number(value)

    if (valueIsOutOfBounds) {
      return `${
        max <= min
          ? `Your input value of ${value} cannot be higher than ${max}`
          : `This field should be between ${min} and ${max}`
      }`
    }

    return true
  })

  defineRule('minValue', (value: string, [min]: string[]) => {
    if (!value || Number(value) > Number(min)) {
      return true
    }

    return `This field should be greater than ${min}`
  })

  defineRule('maxValue', (value: string, [max]: string[]) => {
    if (!value || Number(value) < Number(max)) {
      return true
    }

    return `This field should be less than ${max}`
  })

  defineRule(
    'required',
    (value: string | number, _, { field }: { field: string }) => {
      if (!value || !value.toString().length || Number(value) === 0) {
        if (field.toLowerCase().includes('amount')) {
          return 'amount is required'
        }

        if (field.includes('-')) {
          return `${field.replaceAll('-', ' ')} is required.`
        }

        return `${formatFieldName(field)} is required.`
      }

      return true
    }
  )

  defineRule('maxCharacter', (value: string, [max]: number[]) => {
    if (value.length > max) {
      return 'Exceeds max characters'
    }

    return true
  })

  defineRule('injAddress', (value: string) => {
    try {
      getEthereumAddress(value)

      return true
    } catch (error: any) {
      return errorMessages.injAddress()
    }
  })

  defineRule('addressByNetwork', (value: string, [network]: Network[]) => {
    if (network === Network.Ethereum) {
      if (!value.startsWith('0x')) {
        return errorMessages[network]()
      }
    } else {
      const isValidCosmosAddress =
        network.toLowerCase().startsWith(value.toLowerCase().substring(0, 3)) &&
        new BigNumberInBase(value.length).gte(3)

      if (!isValidCosmosAddress && errorMessages[network]) {
        return errorMessages[network]()
      }
    }

    return true
  })

  defineRule('positiveNumber', (value: string) => {
    if (NUMBER_REGEX.test(value)) {
      return true
    }

    return errorMessages.positiveNumber()
  })

  defineRule('regex', (value: string, params: [string | RegExp]): boolean => {
    let regex = params[0]

    if (typeof regex === 'string') {
      regex = new RegExp(regex)
    }

    return regex.exec(value) !== null
  })

  defineRule('positiveNumber', (value: string) => {
    if (NUMBER_REGEX.test(value)) {
      return true
    }

    return errorMessages.positiveNumber()
  })

  defineRule('integer', (value: string, [fieldName]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value || 0)

    if (valueInBigNumber.lte(0)) {
      return errorMessages.integer(fieldName)
    }

    return true
  })

  defineRule('betweenSgt', (value: string, [min, max]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value)
    const minInBigNumber = new BigNumberInBase(min)
    const maxInBigNumber = new BigNumberInBase(max)

    const isBetween =
      valueInBigNumber.lte(maxInBigNumber) &&
      valueInBigNumber.gte(minInBigNumber)

    if (!isBetween) {
      return `Value must be between: ${min} and ${max}`
    }

    return true
  })

  defineRule('invalidIfBetween', (value: string, [min, max]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value)
    const minInBigNumber = new BigNumberInBase(min)
    const maxInBigNumber = new BigNumberInBase(max)

    const isBetween =
      valueInBigNumber.lte(maxInBigNumber) &&
      valueInBigNumber.gte(minInBigNumber)

    if (isBetween) {
      return `Price range must be outside of ${minInBigNumber.toFixed(
        UI_DEFAULT_MIN_DISPLAY_DECIMALS
      )} - ${maxInBigNumber.toFixed(UI_DEFAULT_MIN_DISPLAY_DECIMALS)}`
    }

    return true
  })

  defineRule('requiredSgt', (value: string) => {
    if (!value) {
      return 'Field is required'
    }

    return true
  })

  defineRule('minValueSgt', (value: string, [min]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value)

    if (valueInBigNumber.lt(min)) {
      return `Minimum amount should be ${min}`
    }

    return true
  })

  defineRule('greaterThanSgt', (value: string, [min]: string[]) => {
    if (!min) {
      return true
    }

    const valueInBigNumber = new BigNumberInBase(value)
    const minInBigNumber = new BigNumberInBase(min)

    if (valueInBigNumber.lte(minInBigNumber)) {
      return `Value should be greater than ${minInBigNumber.toFixed()}`
    }

    return true
  })

  defineRule('lessThanSgt', (value: string, [max]: string[]) => {
    if (!max) {
      return true
    }

    const valueInBigNumber = new BigNumberInBase(value)
    const maxInBigNumber = new BigNumberInBase(max)

    if (valueInBigNumber.gte(maxInBigNumber)) {
      return `Value should be less than ${maxInBigNumber.toFixed()}`
    }

    return true
  })

  defineRule('minInvestmentSgt', (value: string, [min]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value)

    if (valueInBigNumber.lt(min)) {
      return `Minimum USDT investment required to run this grid strategy is ${min}`
    }

    return true
  })

  defineRule('insufficientSgt', (value: string, [max]: string[]) => {
    const valueInBigNumber = new BigNumberInBase(value)

    if (valueInBigNumber.gt(max)) {
      return `Insufficient Amount`
    }

    return true
  })

  defineRule(
    'minBaseAndQuoteAmountSgt',
    (
      _value: string,
      [amountA, amountB, threshold, baseSymbol, quoteSymbol]: string[]
    ) => {
      const amountAInBigNumber = new BigNumberInBase(amountA)
      const amountBInBigNumber = new BigNumberInBase(amountB)

      const thresholdInBigNumber = new BigNumberInBase(threshold)

      if (
        amountAInBigNumber.plus(amountBInBigNumber).lt(thresholdInBigNumber)
      ) {
        return `Min ${baseSymbol}+${quoteSymbol} value >= $${thresholdInBigNumber.toFixed(
          UI_DEFAULT_MIN_DISPLAY_DECIMALS
        )}`
      }

      return true
    }
  )

  defineRule('minTotalAmountUsdSgt', (_value: string, [amount]: string[]) => {
    const min = 50
    const amountInBigNumber = new BigNumberInBase(amount)

    if (amountInBigNumber.lt(min)) {
      return `Total amount should be greater than $ ${min} USD`
    }

    return true
  })

  defineRule('requiredIfEmpty', (value: string, [fieldValue]: string[]) => {
    if (!fieldValue && !value) {
      return 'At least one field is required'
    }

    return true
  })

  defineRule(
    'rangeSgt',
    (_: string, [lower, upper, levels, minPriceTickSize]: string[]) => {
      const upperInBigNumber = new BigNumberInBase(upper)
      const threshold = new BigNumberInBase(levels)
        .times(minPriceTickSize)
        .times(10)

      if (upperInBigNumber.minus(lower).lt(threshold)) {
        return 'The price range provided cannot support that many grids. Please lower the number of grids.'
      }

      return true
    }
  )

  defineRule(
    'gridRangeSgt',
    (_: string, [lower, upper, levels, minPriceTickSize]: string[]) => {
      const upperInBigNumber = new BigNumberInBase(upper)
      const lowerInBigNumber = new BigNumberInBase(lower)
      const levelsInBigNumber = new BigNumberInBase(levels)

      const deltaPrice = upperInBigNumber
        .minus(lowerInBigNumber)
        .dividedBy(levelsInBigNumber)

      if (deltaPrice.lt(minPriceTickSize)) {
        return 'Invalid grid spacing'
      }

      return true
    }
  )

  defineRule('fixedCharacters', (value: string, [length]: string[]) => {
    if (value.length !== Number(length)) {
      return errorMessages.fixedLength(length)
    }
    return true
  })

  defineRule(
    'singleSided',
    (
      _: string,
      [lower, upper, currentPrice, field, threshold]: string[]
    ): boolean | string => {
      const currentPriceInBigNumber = new BigNumberInBase(currentPrice)

      const lowerThreshold = currentPriceInBigNumber.plus(
        currentPriceInBigNumber.times(threshold)
      )
      const upperThreshold = currentPriceInBigNumber.minus(
        currentPriceInBigNumber.times(threshold)
      )

      if (field === SpotGridTradingField.LowerPrice) {
        if (
          currentPriceInBigNumber.lt(lower) &&
          currentPriceInBigNumber.lt(upper) &&
          lowerThreshold.gt(lower)
        ) {
          return `Lower price level should be above ${lowerThreshold.toFixed(
            2
          )}`
        }
      }

      if (field === SpotGridTradingField.UpperPrice) {
        if (
          currentPriceInBigNumber.gt(lower) &&
          currentPriceInBigNumber.gt(upper) &&
          upperThreshold.lt(upper)
        ) {
          return `Upper price level should be below ${upperThreshold.toFixed(
            2
          )}`
        }
      }

      return true
    }
  )
}

export default defineNuxtPlugin(() => {
  defineGlobalRules()
  defineTradeRules()
})

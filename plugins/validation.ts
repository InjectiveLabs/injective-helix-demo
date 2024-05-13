import { defineNuxtPlugin } from '#app'
import { getEthereumAddress } from '@injectivelabs/sdk-ts'
import { NUMBER_REGEX, BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { defineRule } from 'vee-validate'
import { BigNumberInBase } from '@injectivelabs/utils'
import { defineTradeRules } from '@/app/client/utils/validation/trade'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { SpotGridTradingField } from '@/types'

const formatFieldName = (value: string) => value.replace(/[^a-z]+/gi, '')

export const errorMessages = {
  email: () => 'This field should be a valid email',
  injAddress: () => 'This field is not a valid Injective address',
  positiveNumber: () => 'This field is not a valid number',
  integer: (fieldName: string) => `${fieldName} must be > 0`,

  [BridgingNetwork.Axelar]: () => 'This field is not a valid Cosmos address',
  [BridgingNetwork.CosmosHub]: () => 'This field is not a valid Cosmos address',
  [BridgingNetwork.Ethereum]: () =>
    'This field is not a valid Ethereum address',
  [BridgingNetwork.Evmos]: () => 'This field is not a valid Evmos address',
  [BridgingNetwork.Moonbeam]: () =>
    'This field is not a valid Moonbeam address',
  [BridgingNetwork.Injective]: () =>
    'This field is not a valid Injective address',
  [BridgingNetwork.Osmosis]: () => 'This field is not a valid Osmosis address',
  [BridgingNetwork.Persistence]: () =>
    'This field is not a valid Persistence address',
  [BridgingNetwork.Secret]: () =>
    'This field is not a valid Secret Network address',
  [BridgingNetwork.Noble]: () =>
    'This field is not a valid Noble Network address',
  [BridgingNetwork.Stride]: () => 'This field is not a valid Stride address',
  [BridgingNetwork.Crescent]: () =>
    'This field is not a valid Crescent address',
  [BridgingNetwork.Sommelier]: () =>
    'This field is not a valid Sommelier address',
  [BridgingNetwork.Canto]: () => 'This field is not a valid Canto address',
  [BridgingNetwork.Kava]: () => 'This field is not a valid Kava address',
  [BridgingNetwork.Oraichain]: () =>
    'This field is not a valid Oraichain address',
  [BridgingNetwork.Migaloo]: () => 'This field is not a valid Migaloo address',
  [BridgingNetwork.Celestia]: () => 'This field is not a valid Celestia address'
} as Record<string, (_field?: string, _params?: Record<string, any>) => string>

export const defineGlobalRules = () => {
  defineRule('email', (value: string) => {
    const validEmailPattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if (!validEmailPattern.test(String(value))) {
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
    if (Number(value) < Number(min)) {
      return `This field should be greater than ${min}`
    }

    return true
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

  defineRule(
    'addressByNetwork',
    (value: string, [network]: BridgingNetwork[]) => {
      if (network === BridgingNetwork.Ethereum) {
        if (!value.startsWith('0x')) {
          return errorMessages[network]()
        }
      } else {
        const isValidCosmosAddress =
          network
            .toLowerCase()
            .startsWith(value.toLowerCase().substring(0, 3)) &&
          new BigNumberInBase(value.length).gte(3)

        if (!isValidCosmosAddress && errorMessages[network]) {
          return errorMessages[network]()
        }
      }

      return true
    }
  )

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
    const valueInBigNumber = new BigNumberInBase(value)
    const minInBigNumber = new BigNumberInBase(min)

    if (valueInBigNumber.lte(minInBigNumber)) {
      return `Value should be greater than ${minInBigNumber.toFixed()}`
    }

    return true
  })

  defineRule('lessThanSgt', (value: string, [max]: string[]) => {
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

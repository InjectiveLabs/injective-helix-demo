import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { ONE_IN_BASE, ZERO_IN_BASE } from '@shared/utils/constant'

export function calculateNotional(params: {
  price: BigNumberInBase
  quantity: BigNumberInBase
}): BigNumberInBase {
  return params.price.times(params.quantity)
}

export function calculateQuantityFromNotional(params: {
  price: BigNumberInBase
  notional: BigNumberInBase
}): BigNumberInBase {
  if (params.price.isZero()) {
    return ZERO_IN_BASE
  }

  return params.notional.div(params.price)
}

export function calculateFeeAmount(params: {
  value: BigNumberInBase
  feeRate: BigNumberInBase
}): BigNumberInBase {
  return params.value.times(params.feeRate)
}

export function calculateNotionalBeforeFee(params: {
  feeRate: BigNumberInBase
  notional: BigNumberInBase
}): BigNumberInBase {
  return params.notional.div(ONE_IN_BASE.plus(params.feeRate))
}

export function calculateSlippagePrice(params: {
  isBuy: boolean
  price: BigNumberInBase
  slippageTolerance: BigNumberInBase
}): BigNumberInBase {
  if (params.isBuy) {
    return params.price.times(ONE_IN_BASE.plus(params.slippageTolerance))
  }

  return params.price.times(ONE_IN_BASE.minus(params.slippageTolerance))
}

export function calculateEstimatedSlippage(params: {
  isBuy: boolean
  bestPrice: BigNumberInBase
  worstPrice: BigNumberInBase
}): BigNumberInBase {
  if (params.bestPrice.isZero() || params.worstPrice.isZero()) {
    return ZERO_IN_BASE
  }

  if (params.isBuy) {
    return params.worstPrice.div(params.bestPrice).minus(1).times(100)
  }

  return params.bestPrice.div(params.worstPrice).minus(1).times(100)
}

export function calculateMinimumNotional(params: {
  priceDecimals: number
  price: BigNumberInBase
  quantityTensMultiplier: number
}): BigNumberInBase {
  const minQuantity = new BigNumberInBase(10).exponentiatedBy(
    params.quantityTensMultiplier
  )

  const minNotional = calculateNotional({
    price: params.price,
    quantity: new BigNumberInBase(minQuantity)
  })

  return new BigNumberInBase(
    minNotional.dp(params.priceDecimals, BigNumber.ROUND_UP)
  )
}

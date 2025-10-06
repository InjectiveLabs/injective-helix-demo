import type { Validator } from '@injectivelabs/sdk-ts'
import type { SharedUiValidator } from '../types'

export const toUiValidator = (validator: Validator): SharedUiValidator => {
  return {
    consensusPubKey: validator.consensusPubKey,
    jailed: validator.jailed,
    status: validator.status,
    unbondingTime: Math.floor(
      new Date(validator.unbondingTime).getTime() / 1000
    ),
    minSelfDelegation: validator.minSelfDelegation,
    operatorAddress: validator.operatorAddress,
    delegatorShares: validator.delegatorShares,
    tokens: validator.tokens,
    unbondingHeight: validator.unbondingHeight,
    commissionRate: validator.commission.commissionRates.rate,
    commission: validator.commission,
    description: validator.description,
    name: validator.description.moniker,
    address: validator.operatorAddress
  }
}

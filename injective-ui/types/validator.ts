import type {
  BondStatus,
  ValidatorCommission,
  ValidatorDescription
} from '@injectivelabs/sdk-ts'

export interface SharedUiValidator {
  name: string
  tokens: string
  jailed: boolean
  address: string
  status: BondStatus
  unbondingTime: number
  commissionRate: string
  unbondingHeight: number
  delegatorShares: string
  operatorAddress: string
  consensusPubKey?: string
  minSelfDelegation: string
  commission: ValidatorCommission
  description: ValidatorDescription
}

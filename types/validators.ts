export enum BondStatus {
  UnBonded = 'UnBonded',
  UnBonding = 'UnBonding',
  Bonded = 'Bonded'
}

export interface ValidatorDescription {
  moniker: string
  identity: string
  website: string
  securityContact: string
  details: string
}

export interface ValidatorCommission {
  commissionRates: {
    rate: string
    maxRate: string
    maxChangeRate: string
  }
  updateTime: Date
}

export interface Validator {
  operatorAddress: string
  consensusPubKey: string
  jailed: boolean
  status: BondStatus
  tokens: string
  delegatorShares: string
  description: ValidatorDescription
  unbondingHeight: number
  unbondingTime: any
  commission: ValidatorCommission
  minSelfDelegation: string
}

export interface UiValidator {
  jailed: boolean
  status: BondStatus
  unbondingTime: number
  unbondingHeight: number
  commissionRate: string
  delegatorShares: string
  tokens: string
  description: ValidatorDescription
  commission: ValidatorCommission
  name: string
  address: string
}

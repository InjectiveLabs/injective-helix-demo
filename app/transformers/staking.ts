import {
  GrpcValidator,
  GrpcValidatorCommission,
  GrpcValidatorDescription
} from '@injectivelabs/chain-consumer'
import { cosmosSdkDecToBigNumber } from '.'
import {
  BondStatus,
  UiValidator,
  Validator,
  ValidatorCommission,
  ValidatorDescription
} from '~/types/validators'

export const validatorsToUiValidators = (
  grpcValidators: GrpcValidator[]
): UiValidator[] => {
  return grpcValidators.map((grpcValidator: GrpcValidator) => {
    const validator = grpcValidatorToValidator(grpcValidator)

    return {
      jailed: validator.jailed,
      status: validator.status,
      unbondingTime: validator.unbondingTime.getSeconds(),
      delegatorShares: validator.delegatorShares,
      tokens: validator.tokens,
      unbondingHeight: validator.unbondingHeight,
      commissionRate: validator.commission.commissionRates.rate,
      commission: validator.commission,
      description: validator.description,
      name: validator.description.moniker,
      address: validator.operatorAddress
    }
  })
}

export const grpcValidatorToValidator = (
  validator: GrpcValidator
): Validator => {
  return {
    operatorAddress: validator.getOperatorAddress(),
    consensusPubKey: validator.getConsensusPubkey(),
    jailed: validator.getJailed(),
    status: grpcValidatorStatusToUiStatus(validator.getStatus()),
    tokens: cosmosSdkDecToBigNumber(validator.getTokens()).toFixed(),
    delegatorShares: cosmosSdkDecToBigNumber(
      validator.getDelegatorShares()
    ).toFixed(),
    description: grpcValidatorDescriptionToUiDescription(
      validator.getDescription()
    ),
    unbondingHeight: validator.getUnbondingHeight(),
    unbondingTime: validator.getUnbondingTime(),
    commission: grpcValidatorCommissionToUiCommission(
      validator.getCommission()
    ),
    minSelfDelegation: validator.getMinSelfDelegation()
  }
}

export const grpcValidatorStatusToUiStatus = (status: number) => {
  switch (status) {
    case 1:
      return BondStatus.UnBonded
    case 2:
      return BondStatus.UnBonding
    case 3:
      return BondStatus.Bonded
    default:
      return BondStatus.UnBonded
  }
}

export const grpcValidatorCommissionToUiCommission = (
  commission?: GrpcValidatorCommission
): ValidatorCommission => {
  const commissionRates = commission ? commission.getCommissionRates() : null

  return {
    commissionRates: {
      rate: cosmosSdkDecToBigNumber(
        commissionRates ? commissionRates.getRate() : '0'
      ).toFixed(),
      maxRate: cosmosSdkDecToBigNumber(
        commissionRates ? commissionRates.getMaxRate() : '0'
      ).toFixed(),
      maxChangeRate: cosmosSdkDecToBigNumber(
        commissionRates ? commissionRates.getMaxChangeRate() : '0'
      ).toFixed()
    },

    updateTime: commission ? commission.getUpdateTime() : new Date()
  }
}

export const grpcValidatorDescriptionToUiDescription = (
  description?: GrpcValidatorDescription
): ValidatorDescription => {
  return {
    moniker: description ? description.getMoniker() : '',
    identity: description ? description.getIdentity() : '',
    website: description ? description.getWebsite() : '',
    securityContact: description ? description.getSecurityContact() : '',
    details: description ? description.getDetails() : ''
  }
}

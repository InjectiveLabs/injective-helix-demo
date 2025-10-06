import { ZERO_IN_BASE } from './../../utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import type {
  PerpetualMarketInfo,
  PerpetualMarketFunding
} from '@injectivelabs/sdk-ts'

export const getTwapEst = ({
  info,
  funding
}: {
  info: PerpetualMarketInfo
  funding: PerpetualMarketFunding
}) => {
  const timeInterval = new BigNumberInBase(funding.lastTimestamp)
    .plus(info.fundingInterval)
    .minus(info.nextFundingTimestamp)
    .multipliedBy(24)

  if (timeInterval.eq(0)) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(funding.cumulativePrice).dividedBy(timeInterval)
}

export const formatFundingRate = ({
  info,
  funding
}: {
  info?: PerpetualMarketInfo
  funding?: PerpetualMarketFunding
}) => {
  if (!info || !funding) {
    return ZERO_IN_BASE
  }

  const hourlyFundingRateCap = new BigNumberInBase(info.hourlyFundingRateCap)
  const estFundingRate = new BigNumberInBase(info.hourlyInterestRate).plus(
    getTwapEst({ info, funding })
  )

  if (estFundingRate.gt(hourlyFundingRateCap)) {
    return new BigNumberInBase(hourlyFundingRateCap).multipliedBy(100)
  }

  if (estFundingRate.lt(hourlyFundingRateCap.times(-1))) {
    return new BigNumberInBase(hourlyFundingRateCap).times(-1).multipliedBy(100)
  }

  return new BigNumberInBase(estFundingRate).multipliedBy(100)
}

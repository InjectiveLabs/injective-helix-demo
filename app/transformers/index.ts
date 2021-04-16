import { BigNumber } from '@injectivelabs/utils'
import { Change } from '~/types'

export const getChangeFromBigNumberValues = (
  n1: BigNumber,
  n2: BigNumber
): Change => {
  if (!n1 || !n2) {
    return Change.NoChange
  }

  const diff = n1.minus(n2)

  if (diff.eq(0)) {
    return Change.NoChange
  }

  return diff.lt(0) ? Change.Increase : Change.Decrease
}

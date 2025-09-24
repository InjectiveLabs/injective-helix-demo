import type { BigNumberInBase } from '@injectivelabs/utils'
import type { ChangeColorClassOptions } from '@/types'

export const getColorClassForChange = (
  value: BigNumberInBase,
  options: ChangeColorClassOptions = {}
) => {
  const { zeroClass, positiveClass, negativeClass } = {
    zeroClass: '',
    negativeClass: 'text-red-500',
    positiveClass: 'text-green-500',
    ...options
  }

  if (value.gt(0)) {
    return positiveClass
  }

  if (value.lt(0)) {
    return negativeClass
  }

  return zeroClass
}

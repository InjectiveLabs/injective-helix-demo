enum SwapError {
  NotEnoughLiquidity = 'Not enough liquidity to fulfill order'
}

export const errorMap = {
  [SwapError.NotEnoughLiquidity]: 'Exceeds available liquidity'
}

export const mapErrorToMessage = (error: string) => {
  const mappedError = Object.values(SwapError).find((swapErrorValue) =>
    error.includes(swapErrorValue)
  )

  return errorMap[mappedError as SwapError] || 'Please try again'
}

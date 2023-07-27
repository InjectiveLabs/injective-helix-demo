enum SwapError {
  NotEnoughLiquidity = 'Not enough liquidity to fulfill order'
}

export const mapErrorToMessage = (error: string) => {
  const errorMap = {
    [SwapError.NotEnoughLiquidity]: 'Not enough liquidity. Try smaller amount.'
  }

  const mappedError = Object.values(SwapError).find((swapErrorValue) =>
    error.includes(swapErrorValue)
  )

  return errorMap[mappedError as SwapError] || 'Please try again'
}

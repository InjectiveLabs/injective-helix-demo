/**
 * Interface defining the parameters for the calculateOptimalInvestment function.
 */
interface OptimalInvestmentParams {
  lowerPriceLevel: number
  upperPriceLevel: number
  currentPrice: number
  baseQuantity: number
  quoteQuantity: number
}

/**
 * Calculates optimal investment values for a grid trading strategy based on price levels, current price, and initial base and quote quantities.
 *
 * @param {OptimalInvestmentParams} params - An object containing the parameters for optimal investment calculation.
 *   @param {number} params.lowerPriceLevel - The lower boundary price of the trading grid.
 *   @param {number} params.upperPriceLevel - The upper boundary price of the trading grid.
 *   @param {number} params.currentPrice - The current market price of the asset (e.g., INJ/USDT).
 *   @param {number} params.baseQuantity - The initial quantity of the base asset (e.g., INJ).
 *   @param {number} params.quoteQuantity - The initial quantity of the quote asset (e.g., USDT).
 * @returns {{ currentRatio: number, optimalRatio: number, optimalBaseAmount: number, optimalQuoteAmount: number, ratioDifference: number }}
 * An object containing:
 *   - currentRatio: The ratio of the current base asset value to the total current portfolio value.
 *   - optimalRatio: The optimal ratio based on the current price and price levels.
 *   - optimalBaseAmount: The calculated optimal amount of base asset to hold to achieve the optimal ratio.
 *   - optimalQuoteAmount: The calculated optimal amount of quote asset to hold to achieve the optimal ratio.
 *   - ratioDifference: The absolute difference between the optimal ratio and the current ratio.
 */
export const calculateOptimalInvestment = (params: OptimalInvestmentParams) => {
  // 1. Extract parameters from the input object.
  const {
    lowerPriceLevel,
    upperPriceLevel,
    currentPrice,
    baseQuantity,
    quoteQuantity
  } = params

  // 2. Calculate the optimal ratio based on the current price within the price range.
  const optimalRatio =
    (currentPrice - lowerPriceLevel) / (upperPriceLevel - lowerPriceLevel)

  // 3. Calculate the current ratio based on the provided base and quote quantities.
  const currentBaseValue = baseQuantity * currentPrice
  const totalCurrentValue = currentBaseValue + quoteQuantity
  const currentRatio =
    totalCurrentValue === 0 ? 0 : currentBaseValue / totalCurrentValue // Avoid division by zero

  // 4. Calculate the total value of the initial investment at the current price.
  const initialBaseValue = baseQuantity * currentPrice
  const totalInitialValue = initialBaseValue + quoteQuantity

  // 5. Calculate the optimal base amount based on the optimal ratio and total initial value.
  const optimalBaseValue = optimalRatio * totalInitialValue
  const optimalBaseAmount = optimalBaseValue / currentPrice

  // 6. Calculate the optimal quote amount based on the optimal ratio and total initial value.
  const optimalQuoteAmount = (1 - optimalRatio) * totalInitialValue

  // 7. Calculate the difference between the optimal ratio and the current ratio.
  const ratioDifference = Math.abs(optimalRatio - currentRatio)

  return {
    currentRatio,
    optimalRatio,
    optimalBaseAmount,
    optimalQuoteAmount,
    ratioDifference
  }
}

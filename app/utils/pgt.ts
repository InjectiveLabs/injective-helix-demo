/**
 * Interface for the parameters of validateTickSize function.
 */
interface ValidateTickSizeParams {
  amount: number
  numberOfGrids: number
  leverage: number
  upperPrice: number
  marketMinTickSize: number
  minGridLevels: number
  maxGridLevels: number
  minLeverage: number
  maxLeverage: number
}

/**
 * Calculates the derived tick size and validates it against the market minimum tick size.
 *
 * @param params - An object containing the parameters for tick size validation.
 * @param params.amount - The total funds (e.g., 50).
 * @param params.numberOfGrids - The number of grids (e.g., 18).
 * @param params.leverage - The leverage (e.g., 10).
 * @param params.upperPrice - The worst price or upper price (e.g., 150000).
 * @param params.marketMinTickSize - The market minimum quantity tick size (e.g., 0.0001).
 * @param params.minGridLevels - The minimum allowed grid levels.
 * @param params.maxGridLevels - The maximum allowed grid levels.
 * @param params.minLeverage - The minimum allowed leverage.
 * @param params.maxLeverage - The maximum allowed leverage.
 * @returns An object containing:
 * - derivedTickSize: The calculated tick size.
 * - isValid: A boolean indicating if the tick size is valid.
 * - additionalAmountNeeded: The additional amount required to meet the minimum tick size if not valid.
 * - gridReductionNeeded: The number of grids to reduce to meet the minimum tick size if not valid.
 * - leverageIncreaseNeeded: The amount to increase leverage to meet the minimum tick size if not valid.
 *
 * Example usage:
 * ```
 * const params = {
 *   amount: 50,
 *   numberOfGrids: 18,
 *   leverage: 10,
 *   upperPrice: 150000,
 *   marketMinTickSize: 0.0001,
 *   minGridLevels: 1,
 *   maxGridLevels: 100,
 *   minLeverage: 1,
 *   maxLeverage: 50
 * };
 *
 * const result = validateTickSize(params);
 * console.log('Derived Tick Size:', result.derivedTickSize);
 * console.log('Is Valid:', result.isValid);
 * console.log('Additional Amount Needed:', result.additionalAmountNeeded);
 * console.log('Grid Reduction Needed:', result.gridReductionNeeded);
 * console.log('Leverage Increase Needed:', result.leverageIncreaseNeeded);
 * // Output should reflect the calculated values.
 * ```
 */
export function validateTickSize({
  amount,
  numberOfGrids,
  leverage,
  upperPrice,
  marketMinTickSize,
  minGridLevels,
  maxGridLevels,
  minLeverage,
  maxLeverage
}: ValidateTickSizeParams): {
  derivedTickSize: number
  isValid: boolean
  additionalAmountNeeded: number
  gridReductionNeeded: number
  leverageIncreaseNeeded: number
} {
  // Calculate derived tick size:
  // Note: Dividing by (1/leverage) is the same as multiplying by leverage.
  const derivedTickSize = ((amount / numberOfGrids) * leverage) / upperPrice

  // Validate tick size and check if grids & leverage are within allowed ranges.
  const validTickSize = derivedTickSize >= marketMinTickSize
  const gridsInRange =
    numberOfGrids >= minGridLevels && numberOfGrids <= maxGridLevels
  const leverageInRange = leverage >= minLeverage && leverage <= maxLeverage
  const isValid = validTickSize && gridsInRange && leverageInRange

  let additionalAmountNeeded = 0
  let gridReductionNeeded = 0
  let leverageIncreaseNeeded = 0

  if (!validTickSize) {
    // Calculate how much more amount is required so that:
    // ((amount + additionalAmountNeeded) / numberOfGrids * leverage) / upperPrice equals the marketMinTickSize.
    additionalAmountNeeded =
      (marketMinTickSize * numberOfGrids * upperPrice) / leverage - amount
    if (additionalAmountNeeded < 0) additionalAmountNeeded = 0

    // Calculate target grids to achieve exactly the marketMinTickSize:
    // (amount / targetGrids * leverage) / upperPrice = marketMinTickSize  =>  targetGrids = (amount * leverage) / (marketMinTickSize * upperPrice)
    let targetGrids = Math.floor(
      (amount * leverage) / (marketMinTickSize * upperPrice)
    )
    // Cannot reduce grids below the minimum allowed.
    if (targetGrids < minGridLevels) {
      targetGrids = minGridLevels
    }
    gridReductionNeeded =
      numberOfGrids > targetGrids ? numberOfGrids - targetGrids : 0

    // Calculate target leverage required:
    // (amount * (leverage + increase)) / numberOfGrids / upperPrice = marketMinTickSize
    // => targetLeverage = (marketMinTickSize * numberOfGrids * upperPrice) / amount
    let targetLeverage =
      (marketMinTickSize * numberOfGrids * upperPrice) / amount
    // Cannot exceed the maximum allowed leverage.
    if (targetLeverage > maxLeverage) {
      targetLeverage = maxLeverage
    }
    leverageIncreaseNeeded =
      targetLeverage > leverage ? targetLeverage - leverage : 0

    // Round leverageIncreaseNeeded to 2 decimal places and then apply ceiling
    leverageIncreaseNeeded = parseFloat(leverageIncreaseNeeded.toFixed(2))
  }

  return {
    derivedTickSize,
    isValid,
    additionalAmountNeeded,
    gridReductionNeeded,
    leverageIncreaseNeeded
  }
}

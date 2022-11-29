export function sanitizeAmount(amount: string): string {
  let result = amount

  // Transforms 12,345.67 to 12345.67
  result = result.replace(/,/gim, '')

  // Transforms 12. to 12
  if (result.endsWith('.')) {
    return result.replace(/\./gim, '')
  }

  return result
}

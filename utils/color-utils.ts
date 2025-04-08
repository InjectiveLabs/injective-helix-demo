export const getColorClassForPnlPercentage = (percentage: number) => {
  if (percentage > 0) {
    return 'text-green-500'
  }

  if (percentage < 0) {
    return 'text-red-500'
  }

  return 'text-coolGray-400'
}

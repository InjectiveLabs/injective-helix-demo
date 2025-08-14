import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'

export const restrictedHelixCountries: string[] = ['CA', 'GB']
export const restrictedSpotMarketsCountries: string[] = []
export const restrictedPerpetualMarketsCountries: string[] = ['US']
export const restrictedLeaderboardCountries: string[] = [
  ...restrictedPerpetualMarketsCountries
]
export const disallowedSpotMarketDenomOrSymbol = [
  'usdy',
  'peggy0x96F6eF951840721AdBF46Ac996b59E0235CB985C' // USDY denom
]

export const isCountryRestrictedFullAccess = (country: string) => {
  const jsonStore = useSharedJsonStore()

  if (!GEO_IP_RESTRICTIONS_ENABLED) {
    return false
  }

  return jsonStore.restrictedCountries.includes(country)
}

export const isCountryRestricted = (country: string) => {
  const jsonStore = useSharedJsonStore()

  if (!GEO_IP_RESTRICTIONS_ENABLED) {
    return false
  }

  return [
    ...restrictedHelixCountries,
    ...jsonStore.restrictedCountries
  ].includes(country)
}

export const isCountryRestrictedForLeaderboard = (country: string) => {
  if (!GEO_IP_RESTRICTIONS_ENABLED) {
    return false
  }

  return (
    isCountryRestricted(country) ||
    restrictedLeaderboardCountries.includes(country)
  )
}

export const isCountryRestrictedForPerpetualMarkets = (country: string) => {
  if (!GEO_IP_RESTRICTIONS_ENABLED) {
    return false
  }

  return (
    isCountryRestricted(country) ||
    restrictedPerpetualMarketsCountries.includes(country)
  )
}

export const isCountryRestrictedForSpotMarket = ({
  country,
  denomOrSymbol
}: {
  country: string
  denomOrSymbol: string
}) => {
  if (!GEO_IP_RESTRICTIONS_ENABLED) {
    return false
  }

  return (
    isCountryRestricted(country) ||
    (restrictedSpotMarketsCountries.includes(country) &&
      disallowedSpotMarketDenomOrSymbol.some((value: string) =>
        value.toLowerCase().includes(denomOrSymbol.toLowerCase())
      ))
  )
}

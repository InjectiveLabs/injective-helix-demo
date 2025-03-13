import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { restrictedCountries } from '@/app/json'

export const restrictedHelixCountries = ['CA', 'GB']
export const restrictedSpotMarketsCountries = ['US']
export const restrictedPerpetualMarketsCountries = ['US']
export const restrictedLeaderboardCountries = [
  ...restrictedPerpetualMarketsCountries
]
export const disallowedSpotMarketDenomOrSymbol = [
  'usdy',
  'peggy0x96F6eF951840721AdBF46Ac996b59E0235CB985C' // USDY denom
]

export const isCountryRestricted = (country: string) =>
  GEO_IP_RESTRICTIONS_ENABLED &&
  [...restrictedCountries, ...restrictedHelixCountries].includes(country)

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

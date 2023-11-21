import { GEO_IP_RESTRICTIONS_ENABLED } from '@/app/utils/constants'

export const restrictedCountries = [
  'CI',
  'JO',
  'MM',
  'IQ',
  'BI',
  'BY',
  'BO',
  'CN',
  'SY',
  'CU',
  'LY',
  'MA',
  'SO',
  'ZW',
  'IR',
  'LR',
  'SD',
  'YE',
  'CD',
  'CG',
  'DZ',
  'KP',
  'VE',
  'BD',
  'ML',
  'NP',
  'RU'
] as string[]

export const restrictedPerpetualMarketsCountries = ['US']
export const restrictedSpotMarketsCountries = ['US']
export const disallowedSpotMarketSymbols = [
  'usdy',
  '0x96F6eF951840721AdBF46Ac996b59E0235CB985C' // USDY denom
]

export const isCountryRestricted = (country: string) =>
  GEO_IP_RESTRICTIONS_ENABLED && restrictedCountries.includes(country)

export const isCountryRestrictedForPerpetualMarkets = (country: string) =>
  GEO_IP_RESTRICTIONS_ENABLED &&
  restrictedPerpetualMarketsCountries.includes(country)

export const isCountryRestrictedForSpotMarket = ({
  country,
  denomOrSymbol
}: {
  country: string
  denomOrSymbol: string
}) =>
  GEO_IP_RESTRICTIONS_ENABLED &&
  restrictedSpotMarketsCountries.includes(country) &&
  disallowedSpotMarketSymbols.includes(denomOrSymbol.toLowerCase())

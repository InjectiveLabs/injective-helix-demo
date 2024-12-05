import {
  Network,
  isDevnet,
  isTestnet,
  isMainnet
} from '@injectivelabs/networks'
import gitVersion from './gitVersion.json'
import devnetTokens from './tokens/devnet.json'
import testnetTokens from './tokens/testnet.json'
import mainnetTokens from './tokens/mainnet.json'
import devnetSwapRoutes from './swap/devnet.json'
import testnetSwapRoutes from './swap/testnet.json'
import mainnetSwapRoutes from './swap/mainnet.json'
import devnetDenoms from './denoms/devnet.json'
import testnetDenoms from './denoms/testnet.json'
import mainnetDenoms from './denoms/mainnet.json'
import devnetCategoryMap from './marketMap/category/devnet.json'
import testnetCategoryMap from './marketMap/category/testnet.json'
import mainnetCategoryMap from './marketMap/category/mainnet.json'
import devnetSpotMarketIdMap from './marketMap/spot/devnet.json'
import testnetSpotMarketIdMap from './marketMap/spot/testnet.json'
import stagingSpotMarketIdMap from './marketMap/spot/staging.json'
import mainnetSpotMarketIdMap from './marketMap/spot/mainnet.json'
import devnetExpiryMarketIdMap from './marketMap/expiry/devnet.json'
import testnetExpiryMarketIdMap from './marketMap/expiry/testnet.json'
import stagingExpiryMarketIdMap from './marketMap/expiry/staging.json'
import mainnetExpiryMarketIdMap from './marketMap/expiry/mainnet.json'
import devnetDerivativeMarketIdMap from './marketMap/derivative/devnet.json'
import testnetDerivativeMarketIdMap from './marketMap/derivative/testnet.json'
import stagingDerivativeMarketIdMap from './marketMap/derivative/staging.json'
import mainnetDerivativeMarketIdMap from './marketMap/derivative/mainnet.json'
import devnetSpotGridMarkets from './grid/spot/devnet.json'
import testnetSpotGridMarkets from './grid/spot/testnet.json'
import stagingSpotGridMarkets from './grid/spot/staging.json'
import mainnetSpotGridMarkets from './grid/spot/mainnet.json'
import devnetDerivativeGridMarkets from './grid/derivative/devnet.json'
import testnetDerivativeGridMarkets from './grid/derivative/testnet.json'
import stagingDerivativeGridMarkets from './grid/derivative/staging.json'
import mainnetDerivativeGridMarkets from './grid/derivative/mainnet.json'
import restrictedCountriesJson from './restrictedCountries.json'
import blacklistedAddressesJson from './blacklistedAddresses.json'

const NETWORK: Network = import.meta.env.VITE_NETWORK as Network
const IS_DEVNET: boolean = isDevnet(NETWORK)
const IS_TESTNET: boolean = isTestnet(NETWORK)
const IS_MAINNET: boolean = isMainnet(NETWORK)
const IS_STAGING = import.meta.env.VITE_ENV === 'staging'

export const getTokens = () => {
  if (IS_DEVNET) {
    return devnetTokens
  }

  if (IS_TESTNET) {
    return testnetTokens
  }

  return mainnetTokens
}

export const getDenoms = () => {
  if (IS_DEVNET) {
    return Object.keys(devnetDenoms)
  }

  if (IS_TESTNET) {
    return Object.keys(testnetDenoms)
  }

  return Object.keys(mainnetDenoms)
}

export const getVerifiedSpotMarketIdMap = () => {
  if (IS_DEVNET) {
    return devnetSpotMarketIdMap
  }

  if (IS_TESTNET) {
    return testnetSpotMarketIdMap
  }

  if (IS_MAINNET && IS_STAGING) {
    return stagingSpotMarketIdMap
  }

  return mainnetSpotMarketIdMap
}

export const getVerifiedDerivativeMarketIdMap = () => {
  if (IS_DEVNET) {
    return devnetDerivativeMarketIdMap
  }

  if (IS_TESTNET) {
    return testnetDerivativeMarketIdMap
  }

  if (IS_MAINNET && IS_STAGING) {
    return stagingDerivativeMarketIdMap
  }

  return mainnetDerivativeMarketIdMap
}

export const getVerifiedExpiryMarketIdMap = () => {
  if (IS_DEVNET) {
    return devnetExpiryMarketIdMap
  }

  if (IS_TESTNET) {
    return testnetExpiryMarketIdMap
  }

  if (IS_MAINNET && IS_STAGING) {
    return stagingExpiryMarketIdMap
  }

  return mainnetExpiryMarketIdMap
}

export const getSpotGridMarkets = () => {
  if (IS_DEVNET) {
    return devnetSpotGridMarkets
  }

  if (IS_TESTNET) {
    return testnetSpotGridMarkets
  }

  if (IS_MAINNET && IS_STAGING) {
    return stagingSpotGridMarkets
  }

  return mainnetSpotGridMarkets
}

export const getDerivativeGridMarkets = () => {
  if (IS_DEVNET) {
    return devnetDerivativeGridMarkets
  }

  if (IS_TESTNET) {
    return testnetDerivativeGridMarkets
  }

  if (IS_MAINNET && IS_STAGING) {
    return stagingDerivativeGridMarkets
  }

  return mainnetDerivativeGridMarkets
}

export const getSwapRoutes = () => {
  if (IS_DEVNET) {
    return devnetSwapRoutes
  }

  if (IS_TESTNET) {
    return testnetSwapRoutes
  }

  return mainnetSwapRoutes
}

export const getCategoryMap = () => {
  let listMap: Record<string, { marketId: string }[]> = mainnetCategoryMap

  if (IS_DEVNET) {
    listMap = devnetCategoryMap
  }

  if (IS_TESTNET) {
    listMap = testnetCategoryMap
  }

  const formattedList = Object.entries(listMap).reduce(
    (list, [key, marketIdMap]: [string, { marketId: string }[]]) => {
      return {
        ...list,
        [key]: marketIdMap.map((item) => item.marketId)
      }
    },
    {} as Record<string, string[]>
  )

  return formattedList
}

export const getRawCategorySlugs = () => {
  let listMap: Record<string, { slug: string }[]> = mainnetCategoryMap

  if (IS_DEVNET) {
    listMap = devnetCategoryMap
  }

  if (IS_TESTNET) {
    listMap = testnetCategoryMap
  }

  return listMap.rwa.map((item) => item.slug)
}

export const gitBuild = () => {
  return (
    gitVersion || {
      branch: 'master',
      tag: 'v0.0.0',
      gitTagLink: '',
      logs: []
    }
  )
}

export const restrictedCountries = restrictedCountriesJson
export const blacklistedAddresses = blacklistedAddressesJson

export const tokens = getTokens()
export const verifiedDenoms = getDenoms()
export const swapRoutes = getSwapRoutes()
export const rwaSlugs = getRawCategorySlugs()
export const marketCategoriesMap = getCategoryMap()

export const spotGridMarkets = getSpotGridMarkets()
export const derivativeGridMarkets = getDerivativeGridMarkets()

export const verifiedDerivativeSlugs = Object.keys(
  getVerifiedDerivativeMarketIdMap()
)
export const verifiedExpiryMarketIds = Object.values(
  getVerifiedExpiryMarketIdMap()
)
export const verifiedDerivativeMarketIds = Object.values(
  getVerifiedDerivativeMarketIdMap()
)
export const verifiedSpotSlugs = Object.keys(getVerifiedSpotMarketIdMap())
export const verifiedExpirySlugs = Object.keys(getVerifiedExpiryMarketIdMap())
export const verifiedSpotMarketIds = Object.values(getVerifiedSpotMarketIdMap())

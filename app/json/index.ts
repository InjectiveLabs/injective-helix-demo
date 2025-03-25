import { Network, isDevnet, isTestnet } from '@injectivelabs/networks'
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
import mainnetSpotMarketIdMap from './marketMap/spot/mainnet.json'
import devnetExpiryMarketIdMap from './marketMap/expiry/devnet.json'
import testnetExpiryMarketIdMap from './marketMap/expiry/testnet.json'
import mainnetExpiryMarketIdMap from './marketMap/expiry/mainnet.json'
import devnetDerivativeMarketIdMap from './marketMap/derivative/devnet.json'
import testnetDerivativeMarketIdMap from './marketMap/derivative/testnet.json'
import mainnetDerivativeMarketIdMap from './marketMap/derivative/mainnet.json'
import devnetSpotGridMarkets from './grid/spot/devnet.json'
import testnetSpotGridMarkets from './grid/spot/testnet.json'
import mainnetSpotGridMarkets from './grid/spot/mainnet.json'
import devnetDerivativeGridMarkets from './grid/derivative/devnet.json'
import testnetDerivativeGridMarkets from './grid/derivative/testnet.json'
import mainnetDerivativeGridMarkets from './grid/derivative/mainnet.json'
import restrictedCountriesJson from './restrictedCountries.json'
import blacklistedAddressesJson from './blacklistedAddresses.json'

const NETWORK: Network = import.meta.env.VITE_NETWORK as Network
const IS_DEVNET: boolean = isDevnet(NETWORK)
const IS_TESTNET: boolean = isTestnet(NETWORK)

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

  return mainnetSpotMarketIdMap
}

export const getVerifiedDerivativeMarketIdMap = () => {
  if (IS_DEVNET) {
    return devnetDerivativeMarketIdMap
  }

  if (IS_TESTNET) {
    return testnetDerivativeMarketIdMap
  }

  return mainnetDerivativeMarketIdMap
}

export const getExpiryMarketIdMap = () => {
  if (IS_DEVNET) {
    return devnetExpiryMarketIdMap
  }

  if (IS_TESTNET) {
    return testnetExpiryMarketIdMap
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

  return mainnetSpotGridMarkets
}

export const getDerivativeGridMarkets = () => {
  if (IS_DEVNET) {
    return devnetDerivativeGridMarkets
  }

  if (IS_TESTNET) {
    return testnetDerivativeGridMarkets
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
  if (IS_DEVNET) {
    return devnetCategoryMap
  }

  if (IS_TESTNET) {
    return testnetCategoryMap
  }

  return mainnetCategoryMap
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
export const marketCategoriesMap = getCategoryMap()

export const spotGridMarkets = getSpotGridMarkets()
export const derivativeGridMarkets = getDerivativeGridMarkets()

export const expiryMarketIdMap = getExpiryMarketIdMap()
export const verifiedSpotMarketIdMap = getVerifiedSpotMarketIdMap()
export const verifiedDerivateMarketIdMap = getVerifiedDerivativeMarketIdMap()

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
import devnetSpotSlugs from './slugs/spot/devnet.json'
import testnetSpotSlugs from './slugs/spot/testnet.json'
import stagingSpotSlugs from './slugs/spot/staging.json'
import mainnetSpotSlugs from './slugs/spot/mainnet.json'
import devnetDerivativeSlugs from './slugs/derivative/devnet.json'
import testnetDerivativeSlugs from './slugs/derivative/testnet.json'
import stagingDerivativeSlugs from './slugs/derivative/staging.json'
import mainnetDerivativeSlugs from './slugs/derivative/mainnet.json'
import devnetExpirySlugs from './slugs/expiry/devnet.json'
import testnetExpirySlugs from './slugs/expiry/testnet.json'
import stagingExpirySlugs from './slugs/expiry/staging.json'
import mainnetExpirySlugs from './slugs/expiry/mainnet.json'
import devnetSpotGridMarkets from './grid/spot/devnet.json'
import testnetSpotGridMarkets from './grid/spot/testnet.json'
import stagingSpotGridMarkets from './grid/spot/staging.json'
import mainnetSpotGridMarkets from './grid/spot/mainnet.json'
import devnetDerivativeGridMarkets from './grid/derivative/devnet.json'
import testnetDerivativeGridMarkets from './grid/derivative/testnet.json'
import stagingDerivativeGridMarkets from './grid/derivative/staging.json'
import mainnetDerivativeGridMarkets from './grid/derivative/mainnet.json'
import marketCategoriesJson from './marketCategories.json'
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

export const getSpotSlugs = () => {
  if (IS_DEVNET) {
    return devnetSpotSlugs
  }

  if (IS_TESTNET) {
    return testnetSpotSlugs
  }

  if (IS_MAINNET && IS_STAGING) {
    return stagingSpotSlugs
  }

  return mainnetSpotSlugs
}

export const getDerivativeSlugs = () => {
  if (IS_DEVNET) {
    return devnetDerivativeSlugs
  }

  if (IS_TESTNET) {
    return testnetDerivativeSlugs
  }

  if (IS_MAINNET && IS_STAGING) {
    return stagingDerivativeSlugs
  }

  return mainnetDerivativeSlugs
}

export const getExpirySlugs = () => {
  if (IS_DEVNET) {
    return devnetExpirySlugs
  }

  if (IS_TESTNET) {
    return testnetExpirySlugs
  }

  if (IS_MAINNET && IS_STAGING) {
    return stagingExpirySlugs
  }

  return mainnetExpirySlugs
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

export const marketCategories = marketCategoriesJson
export const restrictedCountries = restrictedCountriesJson
export const blacklistedAddresses = blacklistedAddressesJson

export const tokens = getTokens()
export const spotSlugs = getSpotSlugs()
export const expirySlugs = getExpirySlugs()
export const derivativeSlugs = getDerivativeSlugs()
export const spotGridMarkets = getSpotGridMarkets()
export const derivativeGridMarkets = getDerivativeGridMarkets()

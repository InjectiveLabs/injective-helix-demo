export enum USDCSymbol {
  PeggyEthereum = 'USDC',
  WormholeEthereum = 'USDCet',
  WormholeSolana = 'USDCso'
}

export const TokenSymbols = {
  WETH: 'wETH',
  USDT: 'USDT',
  INJ: 'INJ'
}

export const tokenToDecimalsOverrideMap = {
  [TokenSymbols.WETH]: 5
}

export const stableCoinSymbols = [
  'USDT',
  'USDC',
  'USDCet',
  'USDCso',
  'USDCnb',
  'USDTkv'
]
export const KAVA_USDT_SYMBOL = 'USDTkv'
export const STINJ_USDT_SYMBOL = 'STINJ'
export const allowanceResetSymbols = ['USDT']
export const SWAP_LOW_LIQUIDITY_SYMBOLS = ['GF', 'ORAI', 'SOMM', 'NEOK']

// for testing only
export const hardCodedDevnetTokens = [
  {
    address: 'kava',
    isNative: false,
    tokenVerification: 'verified',
    decimals: 6,
    symbol: 'KAVA',
    name: 'KAVA',
    logo: 'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/6f015260-c589-499f-b692-a57964af9900/public',
    coinGeckoId: '',
    tokenType: 'symbol',
    denom: 'kava',
    externalLogo: 'unknown.png'
  },
  {
    address: 'uni',
    isNative: false,
    tokenVerification: 'verified',
    decimals: 6,
    symbol: 'UNI',
    name: 'UNI',
    logo: 'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/6f015260-c589-499f-b692-a57964af9900/public',
    coinGeckoId: '',
    tokenType: 'symbol',
    denom: 'uni',
    externalLogo: 'unknown.png'
  },
  {
    address: 'factory/inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z/AAVE',
    isNative: false,
    tokenVerification: 'verified',
    decimals: 8,
    name: 'AAVE',
    symbol: 'AAVE',
    coinGeckoId: 'injective-quants',
    logo: 'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/6f015260-c589-499f-b692-a57964af9900/public',
    creator: 'inj127l5a2wmkyvucxdlupqyac3y0v6wqfhq03ka64',
    denom: 'factory/inj17gkuet8f6pssxd8nycm3qr9d9y699rupv6397z/AAVE',
    tokenType: 'tokenFactory',
    externalLogo: 'qunt.webp'
  }
]

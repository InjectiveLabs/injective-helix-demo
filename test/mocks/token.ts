import { TokenType } from '@injectivelabs/token-metadata'

export const btcTokenMeta = {
  denom: 'btc',
  logo: 'bitcoin.svg',
  symbol: 'BTC',
  name: 'Bitcoin',
  decimals: 8,
  address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  tokenType: TokenType.Erc20,
  coinGeckoId: 'bitcoin'
}

export const injTokenMeta = {
  denom: 'inj',
  logo: 'injective-v3.svg',
  symbol: 'INJ',
  name: 'Injective',
  decimals: 18,
  address: '0xBe8d71D26525440A03311cc7fa372262c5354A3c',
  tokenType: TokenType.Native,
  coinGeckoId: 'injective-protocol'
}

export const usdtTokenMeta = {
  denom: 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7',
  logo: 'usdt.svg',
  symbol: 'USDT',
  name: 'Tether',
  decimals: 6,
  address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  tokenType: TokenType.Erc20,
  coinGeckoId: 'tether'
}

export const atomTokenMeta = {
  address: '0x8D983cb9388EaC77af0474fA441C4815500Cb7BB',
  baseDenom: 'uatom',
  channelId: 'channel-1',
  coinGeckoId: 'cosmos',
  decimals: 6,
  denom: 'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9',
  isCanonical: true,
  logo: 'atom.svg',
  name: 'Cosmos',
  path: 'transfer/channel-1',
  symbol: 'ATOM',
  tokenType: TokenType.Ibc
}

export const bnbTokenMeta = {
  denom: 'peggy0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
  logo: 'bnb.svg',
  symbol: 'BNB',
  name: 'Binance Coin',
  decimals: 18,
  address: '0xb8c77482e45f1f44de1745f52c74426c631bdd52',
  tokenType: TokenType.Erc20,
  coinGeckoId: 'binancecoin'
}

export const uniTokenMeta = {
  denom: 'uni',
  logo: 'uni.svg',
  symbol: 'UNI',
  name: 'Uniswap',
  decimals: 18,
  address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  tokenType: TokenType.Erc20,
  coinGeckoId: 'uniswap'
}

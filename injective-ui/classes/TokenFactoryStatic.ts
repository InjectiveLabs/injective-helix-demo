
import {
  TokenType,
  TokenVerification,
  isCw20ContractAddress
} from '@injectivelabs/sdk-ts'
import type {
  TokenSource,
  TokenStatic
} from '@injectivelabs/sdk-ts';


export class TokenStaticFactory {
  public factoryTokenDenomUnverifiedMap: Record<string, TokenStatic>

  public factoryTokenDenomVerifiedMap: Record<string, TokenStatic>
  public ibcBaseDenomsUnverifiedMap: Record<string, TokenStatic>
  public cw20AddressUnverifiedMap: Record<string, TokenStatic>

  public ibcBaseDenomsVerifiedMap: Record<string, TokenStatic>
  public cw20AddressVerifiedMap: Record<string, TokenStatic>

  public ibcDenomsUnverifiedMap: Record<string, TokenStatic>
  public ibcDenomsVerifiedMap: Record<string, TokenStatic>

  public denomBlacklistedMap: Record<string, TokenStatic>
  public denomUnverifiedMap: Record<string, TokenStatic>
  public insuranceTokensMap: Record<string, TokenStatic>
  public denomVerifiedMap: Record<string, TokenStatic>

  public symbolTokensMap: Record<string, TokenStatic>
  public registry: TokenStatic[]

  constructor(registry: TokenStatic[]) {
    this.registry = registry

    this.denomVerifiedMap = {}
    this.denomBlacklistedMap = {}
    this.denomUnverifiedMap = {}

    this.cw20AddressVerifiedMap = {}
    this.cw20AddressUnverifiedMap = {}

    this.factoryTokenDenomVerifiedMap = {}
    this.factoryTokenDenomUnverifiedMap = {}

    this.ibcDenomsVerifiedMap = {}
    this.ibcDenomsUnverifiedMap = {}
    this.ibcBaseDenomsVerifiedMap = {}
    this.ibcBaseDenomsUnverifiedMap = {}
    this.symbolTokensMap = {}
    this.insuranceTokensMap = {}

    if (registry.length > 0) {
      this.mapRegistry(registry)
    }
  }

  mapRegistry(registry: TokenStatic[]) {
    for (const token of registry) {
      const {
        denom,
        baseDenom,
        symbol,
        address,
        tokenType,
        tokenVerification,
      } = token

      if (tokenVerification === TokenVerification.Verified) {
        this.denomVerifiedMap[denom] = token
        this.symbolTokensMap[symbol.toLowerCase()] = token
      } else {
        this.denomUnverifiedMap[denom] = token
      }

      if (tokenType === TokenType.InsuranceFund) {
        this.insuranceTokensMap[symbol.toLowerCase()] = token
      }

      if (denom.startsWith('factory/')) {
        if (tokenVerification === TokenVerification.Verified) {
          this.factoryTokenDenomVerifiedMap[denom] = token
        } else {
          this.factoryTokenDenomUnverifiedMap[denom] = token
        }
      }

      if (tokenType === TokenType.Cw20) {
        if (tokenVerification === TokenVerification.Verified) {
          this.cw20AddressVerifiedMap[address] = token
        } else {
          this.cw20AddressUnverifiedMap[address] = token
        }
      }

      if (tokenType === TokenType.Ibc) {
        if (tokenVerification === TokenVerification.Verified) {
          this.ibcDenomsVerifiedMap[denom] = token

          if (baseDenom) {
            const existingIbcBaseDenomToken =
              this.ibcBaseDenomsVerifiedMap[baseDenom]

            if (
              !existingIbcBaseDenomToken ||
              !existingIbcBaseDenomToken.isNative
            ) {
              this.ibcBaseDenomsVerifiedMap[baseDenom] = token
            }
          }
        } else {
          this.ibcDenomsUnverifiedMap[denom] = token

          if (baseDenom && token.baseDenom !== 'Unknown') {
            this.ibcBaseDenomsUnverifiedMap[baseDenom] = token
          }
        }
      }
    }
  }

  toToken(
    denomOrSymbol: string,
    {
      source,
      verification,
    }: {
      source?: TokenSource
      verification?: TokenVerification
    } = {},
  ): undefined | TokenStatic {
    const denomOrSymbolTrimmed = denomOrSymbol.trim()

    if (denomOrSymbolTrimmed === 'inj') {
      return this.denomVerifiedMap[denomOrSymbolTrimmed]
    }

    if (source) {
      return this.getIbcToken(denomOrSymbol, {
        source,
        tokenVerification: verification,
      })
    }

    if (denomOrSymbolTrimmed.startsWith('factory/wormhole')) {
      return this.getIbcToken(denomOrSymbolTrimmed, {
        tokenVerification: verification,
      })
    }

    if (denomOrSymbolTrimmed.length < 42) {
      return (
        this.getSymbolToken(denomOrSymbolTrimmed) ||
        this.getInsuranceToken(denomOrSymbolTrimmed) ||
        this.getIbcToken(denomOrSymbolTrimmed, {
          tokenVerification: verification,
        }) ||
        this.denomVerifiedMap[denomOrSymbolTrimmed]
      )
    }

    if (isCw20ContractAddress(denomOrSymbolTrimmed)) {
      return this.getCw20Token(denomOrSymbolTrimmed, {
        tokenVerification: verification,
      })
    }

    if (denomOrSymbolTrimmed.startsWith('factory/')) {
      return this.getTokenFactoryToken(denomOrSymbolTrimmed, {
        tokenVerification: verification,
      })
    }

    return (
      this.denomVerifiedMap[denomOrSymbolTrimmed] ||
      this.denomUnverifiedMap[denomOrSymbolTrimmed]
    )
  }

  getIbcToken(
    denom: string,
    {
      source,
      tokenVerification,
    }: {
      source?: TokenSource
      tokenVerification?: TokenVerification
    } = {},
  ): undefined | TokenStatic {
    const denomTrimmed = denom.trim()

    if (source) {
      const list =
        tokenVerification === TokenVerification.Verified
          ? Object.values(this.ibcDenomsVerifiedMap)
          : [
              ...Object.values(this.ibcDenomsVerifiedMap),
              ...Object.values(this.ibcDenomsVerifiedMap).flat(),
            ]

      return list.find(
        (token: TokenStatic) =>
          token.source === source &&
          (token.denom === denomTrimmed || token?.baseDenom === denomTrimmed),
      )
    }

    if (tokenVerification === TokenVerification.Verified) {
      return (
        this.ibcBaseDenomsVerifiedMap[denomTrimmed] ||
        this.ibcDenomsVerifiedMap[denomTrimmed]
      )
    }

    return (
      this.ibcBaseDenomsVerifiedMap[denomTrimmed] ||
      this.ibcDenomsVerifiedMap[denomTrimmed] ||
      this.ibcBaseDenomsUnverifiedMap[denomTrimmed] ||
      this.ibcDenomsUnverifiedMap[denomTrimmed]
    )
  }

  getTokenFactoryToken(
    denom: string,
    { tokenVerification }: { tokenVerification?: TokenVerification } = {},
  ): undefined | TokenStatic {
    if (tokenVerification === TokenVerification.Verified) {
      return this.factoryTokenDenomVerifiedMap[denom]
    }

    return (
      this.factoryTokenDenomVerifiedMap[denom] ||
      this.factoryTokenDenomUnverifiedMap[denom]
    )
  }

  getCw20Token(
    address: string,
    { tokenVerification }: { tokenVerification?: TokenVerification } = {},
  ): undefined | TokenStatic {
    if (tokenVerification === TokenVerification.Verified) {
      return this.cw20AddressVerifiedMap[address]
    }

    return (
      this.cw20AddressVerifiedMap[address] ||
      this.cw20AddressUnverifiedMap[address]
    )
  }

  getInsuranceToken(symbol: string): undefined | TokenStatic {
    return this.insuranceTokensMap[symbol.toLowerCase()]
  }

  getSymbolToken(symbol: string): undefined | TokenStatic {
    return this.symbolTokensMap[symbol.toLowerCase()]
  }
}

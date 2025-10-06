import { injToken, unknownToken } from '../../data/token'
import {
  TokenType,
  TokenVerification,
  isCw20ContractAddress
} from '@injectivelabs/sdk-ts'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

export class SharedTokenClientStatic {
  formatToken(denom: string): TokenStatic {
    if (denom.startsWith('share')) {
      return this.#formatInsuranceToken(denom)
    }

    if (denom.startsWith('ibc')) {
      return this.#formatIbcToken(denom)
    }

    const defaultToken = {
      ...unknownToken,
      denom,
      name: denom,
      address: denom
    }

    if (denom.startsWith('peggy')) {
      return {
        ...defaultToken,
        tokenType: TokenType.Erc20
      }
    }

    if (denom.startsWith('factory')) {
      const address = denom.split('/').pop() as string
      const tokenType = isCw20ContractAddress(address)
        ? TokenType.Cw20
        : TokenType.TokenFactory

      return {
        ...defaultToken,
        tokenType
      }
    }

    if (denom.startsWith('erc20:')) {
      return {
        ...defaultToken,
        tokenType: TokenType.Evm
      }
    }

    return defaultToken
  }

  #formatInsuranceToken(denom: string): TokenStatic {
    return {
      denom,
      name: denom,
      decimals: 18,
      symbol: denom,
      address: denom,
      logo: injToken.logo,
      externalLogo: injToken.logo,
      tokenType: TokenType.InsuranceFund,
      coinGeckoId: unknownToken.coinGeckoId,
      tokenVerification: TokenVerification.Unverified
    }
  }

  #formatIbcToken(denom: string): TokenStatic {
    const hash = denom.replace('ibc/', '')

    return {
      ...unknownToken,
      denom,
      hash,
      address: denom,
      tokenType: TokenType.Ibc
    }
  }
}

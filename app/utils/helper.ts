import {
  getCw20FromSymbolOrName,
  getIbcDenomFromSymbolOrName,
  getPeggyDenomFromSymbolOrName
} from '@injectivelabs/token-metadata'
import { NETWORK } from '@/app/utils/constants'

/** used for tokens that we know exist in the token-metadata package so we don't do type-casting */
export const getIbcDenomFromSymbolOrNameAsString = (symbolOrName: string) =>
  getIbcDenomFromSymbolOrName({ symbolOrName, network: NETWORK }) as string

/** used for tokens that we know exist in the token-metadata package so we don't do type-casting */
export const getCw20FromSymbolOrNameAsString = (symbolOrName: string) =>
  getCw20FromSymbolOrName(symbolOrName, NETWORK) as string

/** used for tokens that we know exist in the token-metadata package so we don't do type-casting */
export const getPeggyDenomFromSymbolOrNameAsString = (symbolOrName: string) =>
  getPeggyDenomFromSymbolOrName(symbolOrName, NETWORK) as string

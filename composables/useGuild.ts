import {
  GUILD_BASE_TOKEN_SYMBOL,
  GUILD_QUOTE_TOKEN_SYMBOL
} from '@/app/utils/constants'

export function useGuild() {
  const tokenStore = useTokenStore()

  const baseToken = computed(() =>
    tokenStore.tokenByDenomOrSymbol(GUILD_BASE_TOKEN_SYMBOL)
  )

  const quoteToken = computed(() =>
    tokenStore.tokenByDenomOrSymbol(GUILD_QUOTE_TOKEN_SYMBOL)
  )

  return {
    baseToken,
    quoteToken
  }
}

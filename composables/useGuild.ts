import {
  GUILD_BASE_TOKEN_SYMBOL,
  GUILD_QUOTE_TOKEN_SYMBOL
} from '@/app/utils/constants'

export function useGuild() {
  const sharedTokenStore = useSharedTokenStore()

  const baseToken = computed(() =>
    sharedTokenStore.tokenByDenomOrSymbol(GUILD_BASE_TOKEN_SYMBOL)
  )

  const quoteToken = computed(() =>
    sharedTokenStore.tokenByDenomOrSymbol(GUILD_QUOTE_TOKEN_SYMBOL)
  )

  return {
    baseToken,
    quoteToken
  }
}

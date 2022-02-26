import { TokenWithBalanceAndPrice } from '@injectivelabs/ui-common'
import { derivatives, spot } from '~/routes.config'
import { tokenService } from '~/app/Services'

const sortToTopSymbols = ['inj']
const tradableSymbols = [
  ...new Set(
    [...sortToTopSymbols, ...derivatives, ...spot]
      .map((market) => market.split('-'))
      .flat()
  )
]

export const getTradableTokenMetaWithBalanceAndPrice = (): TokenWithBalanceAndPrice[] => {
  return tradableSymbols
    .map((symbol) => {
      let tokenMeta = tokenService.getTokenMetaDataBySymbol(
        symbol.toUpperCase()
      )

      if (symbol === 'eth') {
        tokenMeta = tokenService.getTokenMetaDataBySymbol('wETH')
      }

      if (!tokenMeta) {
        return undefined
      }

      return {
        ...tokenMeta,
        logo: `/vendor/@injectivelabs/token-metadata/${tokenMeta.logo}`,
        denom: `peggy${tokenMeta.address}`,
        balance: '0',
        allowance: '0',
        usdPrice: 0
      }
    })
    .filter(
      (token) => token !== undefined && token.address !== ''
    ) as TokenWithBalanceAndPrice[]
}

import { ConvertTradeErrorLinkType } from '~/components/partials/convert/types'

export interface TradeError {
  amount?: string
  price?: string
  slippage?: string
  linkType?: ConvertTradeErrorLinkType
}

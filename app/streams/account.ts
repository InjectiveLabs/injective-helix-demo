import {
  SubaccountStreamType,
  BalanceStreamCallback as SubaccountBalanceStreamCallback
} from '@injectivelabs/subaccount-consumer'
import { subaccountStream } from '../singletons/SubaccountStream'
import { streamProvider } from '../providers/StreamProvider'

export const streamSubaccountBalances = ({
  subaccountId,
  callback
}: {
  subaccountId: string
  callback: SubaccountBalanceStreamCallback
}) => {
  const streamFn = subaccountStream.balances.start.bind(
    subaccountStream.balances
  )
  const streamFnArgs = {
    subaccountId,
    callback
  }

  streamProvider.subscribe({
    fn: streamFn,
    args: streamFnArgs,
    key: SubaccountStreamType.Balances
  })
}

export const cancelSubaccountStreams = () => {
  streamProvider.cancel(SubaccountStreamType.Balances)
}

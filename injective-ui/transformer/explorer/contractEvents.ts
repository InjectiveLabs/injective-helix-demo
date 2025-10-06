import { type EventLog } from '@injectivelabs/sdk-ts'
import { ContractMsgType } from './../../types'

export const contractEventSummaryMap: Partial<
  Record<
    ContractMsgType,
    ({
      args,
      logs,
      sender
    }: {
      args?: any
      logs: EventLog[]
      sender: string
    }) => string | undefined
  >
> = {
  [ContractMsgType.Swap]: ({ logs, sender }) => {
    try {
      const parsedEvents = logs
        .flatMap(({ events }) => events)
        .filter(({ type }) => type === 'wasm-atomic_swap_execution')

      const swapInputAmount = parsedEvents[0].attributes.find(
        ({ key }) => key === 'swap_input_amount'
      )?.value

      const swapInputDenom = parsedEvents[0].attributes.find(
        ({ key }) => key === 'swap_input_denom'
      )?.value

      const swapFinalAmount = parsedEvents[0].attributes.find(
        ({ key }) => key === 'swap_final_amount'
      )?.value

      const swapFinalDenom = parsedEvents[0].attributes.find(
        ({ key }) => key === 'swap_final_denom'
      )?.value

      if (
        !swapFinalDenom ||
        !swapInputDenom ||
        !swapInputAmount ||
        !swapFinalAmount
      ) {
        return undefined
      }

      return `{{account:${sender}}} Swapped {{denom:${swapInputDenom}-${swapInputAmount}}} to {{denom:${swapFinalDenom}-${swapFinalAmount}}}`
    } catch (e: any) {
      return undefined
    }
  }
}

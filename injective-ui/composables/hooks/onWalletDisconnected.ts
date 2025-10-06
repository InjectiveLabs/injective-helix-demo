import { EventBus } from './../../types'

export const onWalletDisconnected = (callback: Function) => {
  onMounted(() => {
    callback()

    useEventBus(EventBus.WalletDisconnected).on(() => callback())
  })
}

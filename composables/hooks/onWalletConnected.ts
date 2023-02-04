import { BusEvents } from '@/types'

export default function onWalletConnected(callback: Function) {
  onMounted(() => {
    callback()

    useEventBus(BusEvents.WalletConnected).on(() => callback())
  })
}

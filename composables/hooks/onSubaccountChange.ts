import { BusEvents } from '@/types'

export default function onSubaccountChange(callback: Function) {
  onMounted(() => {
    callback()

    useEventBus(BusEvents.SubaccountChange).on(() => callback())
  })
}

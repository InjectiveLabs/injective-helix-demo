import { NuxtUiIcons } from '@shared/types'
import { Wallet } from '@injectivelabs/wallet-base'
import { MAX_TOAST_TIMEOUT } from '@shared/utils/constant'
import { TRADING_MESSAGES } from '@/app/data/trade'
import * as EventTracker from '@/app/providers/mixpanel/EventTracker'
import { HelixCtaToast, MixPanelEvent } from '@/types'

export function useAutosignCta() {
  const sharedWalletStore = useSharedWalletStore()
  const notificationStore = useSharedNotificationStore()
  const { t } = useLang()
  const { $onError } = useNuxtApp()

  function showAutosignCta(tradesCount: number) {
    if (
      tradesCount ||
      ([Wallet.Magic, Wallet.Turnkey] as Wallet[]).includes(
        sharedWalletStore.wallet
      )
    ) {
      return
    }

    EventTracker.trackGenericEvent(MixPanelEvent.AutoSignCTAPopUp)

    notificationStore.success({
      timeout: MAX_TOAST_TIMEOUT,
      icon: NuxtUiIcons.RotateAuto,
      key: HelixCtaToast.EnableAutoSign,
      title: t('toast.portfolio.autoSign.enable.title'),
      description: t('toast.portfolio.autoSign.enable.description'),
      actions: [
        {
          label: t('common.enable'),
          callback: () => {
            EventTracker.trackGenericEvent(MixPanelEvent.AutoSignCTAEnabled)

            sharedWalletStore
              .connectAutoSign(
                TRADING_MESSAGES
                // CONTRACT_EXECUTION_COMPAT_AUTHZ // TODO: Add this when we have authz contract exec support
              )
              .then(() => {
                notificationStore.update({
                  title: t('toast.portfolio.autoSign.enabledToast.title'),
                  description: t(
                    'toast.portfolio.autoSign.enabledToast.description'
                  )
                })
              })
              .catch($onError)
          }
        }
      ]
    })
  }

  return {
    showAutosignCta
  }
}

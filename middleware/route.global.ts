import { trackOnramperSuccess } from '@/app/providers/mixpanel/EventTracker'
import { Modal, MainPage, PortfolioSubPage } from '@/types'

export default defineNuxtRouteMiddleware((to) => {
  const nuxtApp = useNuxtApp()
  const appStore = useAppStore()
  const sharedModalStore = useSharedModalStore()
  const notificationStore = useSharedNotificationStore()

  const { t } = nuxtApp?.$i18n || {}

  if (
    ![
      MainPage.Index,
      MainPage.Portfolio,
      ...Object.values(PortfolioSubPage)
    ].includes(to.name as MainPage) &&
    appStore.isCountryRestricted
  ) {
    sharedModalStore.openModal(Modal.GeoRestricted)

    return navigateTo({ name: MainPage.Index })
  }

  if (to.query.onramper_status === 'success') {
    const {
      network,
      orderId,
      fiatAmount,
      cryptoAmount,
      fiatCurrency,
      walletAddress,
      partnerOrderId,
      totalFeeInFiat,
      cryptoCurrency
    } = (to.query as Record<string, string>) || {}

    notificationStore.success({
      title: t('onboarding.onramperSuccess', {
        fiatCurrency,
        cryptoAmount,
        crypto: to.query.cryptoCurrency
      })
    })

    trackOnramperSuccess({
      network,
      orderId,
      fiatAmount,
      cryptoAmount,
      fiatCurrency,
      walletAddress,
      totalFeeInFiat,
      cryptoCurrency,
      partnerOrderId
    })
  }

  if (to.fullPath.includes('?') && !to.fullPath.includes('/?')) {
    const [path, query] = to.fullPath.split('?')
    const newPath = `${path}/?${query}`

    return navigateTo(newPath)
  }
})

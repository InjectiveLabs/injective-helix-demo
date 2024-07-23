<script lang="ts" setup>
import { Modal, MainPage, UiMarketWithToken } from '@/types'
import { isCountryRestrictedForSpotMarket } from '@/app/data/geoip'

const appStore = useAppStore()
const modalStore = useModalStore()

const props = defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const disallowedTokenSymbol = computed(() => {
  const disallowedToken = [
    props.market.baseToken,
    props.market.quoteToken
  ].find((token) =>
    isCountryRestrictedForSpotMarket({
      country:
        appStore.userState.geoLocation.browserCountry ||
        appStore.userState.geoLocation.country,
      denomOrSymbol: token.symbol.toLowerCase()
    })
  )

  return disallowedToken?.symbol
})

const isModalOpen = computed(() =>
  props.isSpot
    ? !!(
        modalStore.modals[Modal.MarketRestricted] && disallowedTokenSymbol.value
      )
    : modalStore.modals[Modal.MarketRestricted]
)

onWalletConnected(() => {
  checkUserIsDisallowed()
})

function checkUserIsDisallowed() {
  if (disallowedTokenSymbol.value) {
    modalStore.openModal(Modal.MarketRestricted)
  }
}

function closeModal() {
  modalStore.closeModal(Modal.MarketRestricted)
}
</script>

<template>
  <AppModal :is-open="isModalOpen" is-sm is-hide-close-button is-always-open>
    <template #title>
      <h3 class="text-center">
        {{ $t('marketRestricted.title') }}
      </h3>
    </template>

    <div class="relative">
      <p class="text-center text-sm text-gray-100">
        {{
          $t(`marketRestricted.description.${isSpot ? 'spot' : 'perpetual'}`, {
            symbol: disallowedTokenSymbol
          })
        }}
      </p>

      <div class="mt-6 flex items-center justify-center">
        <NuxtLink :to="{ name: MainPage.Index }">
          <AppButton class="bg-blue-500 text-blue-900" @click="closeModal">
            {{ $t('marketRestricted.cta') }}
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </AppModal>
</template>

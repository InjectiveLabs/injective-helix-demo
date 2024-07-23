<script lang="ts" setup>
import { Modal, MainPage, UiMarketWithToken } from '@/types'
import {
  isCountryRestrictedForSpotMarket,
  isCountryRestrictedForPerpetualMarkets
} from '@/app/data/geoip'

const appStore = useAppStore()
const modalStore = useModalStore()

const props = defineProps({
  isSpot: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isModalOpen = computed(() => modalStore.modals[Modal.MarketRestricted])

onMounted(() => {
  checkUserIsDisallowed()
})

function checkUserIsDisallowed() {
  const isRestricted = props.isSpot
    ? isCountryRestrictedForSpotMarket({
        country:
          appStore.userState.geoLocation.browserCountry ||
          appStore.userState.geoLocation.country,
        denomOrSymbol: props.market.baseToken.symbol.toLowerCase()
      })
    : isCountryRestrictedForPerpetualMarkets(
        appStore.userState.geoLocation.browserCountry ||
          appStore.userState.geoLocation.country
      )

  if (isRestricted) {
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
            symbol: market.baseToken.symbol
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

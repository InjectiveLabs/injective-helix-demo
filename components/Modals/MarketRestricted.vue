<script lang="ts" setup>
import { Modal, MainPage, UiMarketWithToken, MarketCategoryType } from '@/types'
import {
  isCountryRestrictedForSpotMarket,
  isCountryRestrictedForPerpetualMarkets
} from '@/app/data/geoip'

const modalStore = useSharedModalStore()
const sharedGeoStore = useSharedGeoStore()

const props = withDefaults(
  defineProps<{ isSpot?: boolean; market: UiMarketWithToken }>(),
  {}
)

const disallowedTokenSymbol = computed(() => {
  const disallowedToken = [
    props.market.baseToken,
    props.market.quoteToken
  ].find((token) =>
    isCountryRestrictedForSpotMarket({
      country: sharedGeoStore.country,
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

onMounted(() => {
  checkUserIsDisallowed()
})

function checkUserIsDisallowed() {
  const isRestricted = props.isSpot
    ? isCountryRestrictedForSpotMarket({
        country: sharedGeoStore.country,
        denomOrSymbol: props.market.baseToken.symbol.toLowerCase()
      })
    : isCountryRestrictedForPerpetualMarkets(sharedGeoStore.country)

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
      <p class="text-center text-sm text-coolGray-100">
        {{
          $t(`marketRestricted.description.${isSpot ? 'spot' : 'perpetual'}`, {
            symbol: market.baseToken.symbol
          })
        }}
      </p>

      <div class="mt-6 flex items-center justify-center">
        <NuxtLink
          :to="{
            name: MainPage.Markets,
            query: {
              category: MarketCategoryType.Spot
            }
          }"
        >
          <AppButton class="bg-blue-500 text-blue-900" @click="closeModal">
            {{ $t('marketRestricted.tradeSpot') }}
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </AppModal>
</template>

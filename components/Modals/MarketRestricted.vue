<script lang="ts" setup>
import {
  isCountryRestricted,
  isCountryRestrictedForSpotMarket,
  isCountryRestrictedForPerpetualMarkets
} from '@/app/data/geoip'
import { Modal, MainPage, MarketCategoryType } from '@/types'
import type { UiMarketWithToken } from '@/types'

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
  if (isCountryRestricted(sharedGeoStore.country)) {
    modalStore.openModal(Modal.GeoRestricted)

    return
  }

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
  <AppModal
    v-bind="{
      isAlwaysOpen: true,
      isHideCloseButton: true,
      modelValue: isModalOpen
    }"
  >
    <img src="/svg/TradingRestriction.svg" class="mx-auto mt-2" />

    <h3 class="text-center font-semibold text-lg mt-8">
      {{
        $t(`trade.marketRestricted.title.${isSpot ? 'spot' : 'perpetual'}`, {
          symbol: market.baseToken.symbol
        })
      }}
    </h3>

    <div class="relative mt-2">
      <p class="text-center text-sm text-coolGray-450">
        {{
          $t(
            `trade.marketRestricted.description.${isSpot ? 'spot' : 'perpetual'}`,
            {
              symbol: market.baseToken.symbol
            }
          )
        }}
      </p>

      <div class="mt-4 flex items-center justify-center w-full">
        <NuxtLink
          v-if="isSpot"
          class="w-full"
          :to="{
            name: MainPage.Index
          }"
        >
          <AppButton class="w-full" @click="closeModal">
            {{ $t('trade.marketRestricted.cta') }}
          </AppButton>
        </NuxtLink>

        <NuxtLink
          v-else
          class="w-full"
          :to="{
            name: MainPage.Markets,
            query: {
              category: MarketCategoryType.Spot
            }
          }"
        >
          <AppButton class="w-full" @click="closeModal">
            {{ $t('trade.marketRestricted.tradeSpot') }}
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </AppModal>
</template>

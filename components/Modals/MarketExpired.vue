<script lang="ts" setup>
import { Modal, MainPage, PortfolioSubPage, UiDerivativeMarket } from '@/types'

const modalStore = useModalStore()
const router = useRouter()

const props = defineProps({
  market: {
    type: Object as PropType<UiDerivativeMarket>,
    default: undefined
  }
})

const isModalOpen = computed(
  () => modalStore.modals[Modal.MarketExpired] && !!props.market
)

function closeModal() {
  modalStore.closeModal(Modal.MarketExpired)
  router.push({ name: MainPage.Markets })
}

function onModalClose() {
  if (!isModalOpen.value) {
    return
  }

  closeModal()
}
</script>

<template>
  <AppModal
    :is-open="isModalOpen"
    is-sm
    is-hide-close-button
    @modal:closed="onModalClose"
  >
    <template #title>
      <h3 class="text-base">
        {{ $t('marketExpired.title') }}
      </h3>
    </template>

    <div v-if="market" class="mt-4">
      <div class="flex items-center">
        <CommonTokenIcon
          v-if="market.baseToken"
          is-lg
          :token="market.baseToken"
          class="mr-4"
        />

        <div class="flex flex-col">
          <p
            data-cy="market-card-ticker-text-content"
            class="uppercase tracking-widest text-sm font-bold leading-4"
          >
            {{ market.ticker }}
          </p>
          <span class="text-xs text-gray-500 capitalize">
            {{ market.baseToken.name }}
          </span>
        </div>
      </div>

      <p class="text-sm text-gray-100 mt-4">
        {{ $t('marketExpired.expiredNote') }}
      </p>
      <p class="text-sm text-gray-100 mt-2">
        {{ $t('marketExpired.activityPageNote') }}
      </p>

      <div class="mt-6 flex items-center justify-center gap-2">
        <NuxtLink
          :to="{ name: MainPage.Markets }"
          class="flex items-center justify-center px-4 py-2"
        >
          <AppButton class="bg-blue-500 text-blue-900 font-semibold">
            <span>{{ $t('marketExpired.exploreMarkets') }}</span>
          </AppButton>
        </NuxtLink>

        <NuxtLink
          :to="{ name: PortfolioSubPage.OrdersFuturesTradeHistory }"
          target="_blank"
        >
          <AppButton
            class="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-blue-900"
          >
            <span>{{ $t('marketExpired.goToFutures') }}</span>
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </AppModal>
</template>

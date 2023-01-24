<script lang="ts" setup>
import { PropType } from 'vue'
import { BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { getHubUrl } from '@/app/utils/helpers'
import { Modal, UiMarketWithToken } from '@/types'

const modalStore = useModalStore()
const router = useRouter()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isTerraNetwork = ['luna-ust', 'luna-ust-perp'].includes(props.market.slug)

const ticker = computed(() => props.market.ticker)
const symbol = computed(() => props.market.baseToken.symbol)
const showModal = computed(() => modalStore.modals[Modal.MarketDeprecated])
const bridgeUrl = computed(() => `${getHubUrl()}/bridge/?token=${symbol.value}`)
const network = computed(() => {
  // todo: expand conditions as required
  if (props.market.slug === 'huahua-usdt') {
    return BridgingNetwork.Chihuahua
  }

  return BridgingNetwork.Injective
})

function close() {
  modalStore.closeModal(Modal.MarketDeprecated)
  router.push({ name: 'index' })
}
</script>

<template>
  <AppModalWrapper :show="showModal" sm @modal:closed="close">
    <template #title>
      <h3 class="text-base">
        {{ $t('marketDeprecated.title') }}
      </h3>
    </template>

    <div class="relative">
      <i18n-t
        keypath="marketDeprecated.description"
        tag="p"
        class="text-sm mb-3"
      >
        <template #ticker>
          <span class="font-bold">{{ ticker }}</span>
        </template>
      </i18n-t>

      <p v-if="isTerraNetwork" class="text-sm">
        {{ $t('marketDeprecated.terraDescription') }}
      </p>

      <ul v-else class="list-disc ml-4 text-xs">
        <li>{{ $t('marketDeprecated.subDescriptionOne', { ticker }) }}</li>
        <i18n-t
          keypath="marketDeprecated.subDescriptionTwo"
          tag="li"
          class="mt-2"
        >
          <template #symbol>
            <span class="uppercase">{{ symbol }}</span>
          </template>

          <template #network>
            <span class="capitalize">{{ network }}</span>
          </template>
        </i18n-t>
      </ul>

      <div class="mt-6 flex flex-col gap-4">
        <NuxtLink :to="{ name: 'markets' }" class="">
          <AppButton lg class="w-full text-blue-900 bg-blue-500">
            <span class="font-semibold">
              {{ $t('marketDeprecated.exploreOtherMarkets') }}
            </span>
          </AppButton>
        </NuxtLink>

        <NuxtLink :to="bridgeUrl" target="_blank">
          <AppButton
            v-if="!isTerraNetwork"
            lg
            class="text-blue-900 bg-blue-500"
          >
            <div class="flex items-center justify-center">
              <span class="mr-2 font-semibold">
                {{ $t('marketDeprecated.injectiveBridge') }}
              </span>
              <BaseIcon name="external-link" class="w-3 h-3" />
            </div>
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </AppModalWrapper>
</template>

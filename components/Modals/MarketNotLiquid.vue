<script lang="ts" setup>
import { Modal, TradeSubPage, NotLiquidMarket } from '@/types'

const modalStore = useModalStore()

const props = defineProps({
  notLiquidMarket: {
    type: Object as PropType<NotLiquidMarket>,
    required: true
  }
})

const slug = props.notLiquidMarket.slug.replaceAll('-', '/').toUpperCase()
const redirectionSlug = props.notLiquidMarket.redirectionSlug
  .replaceAll('-', '/')
  .toUpperCase()

onMounted(() => {
  modalStore.openModal(Modal.MarketNotLiquid)
})

function onCloseModal() {
  modalStore.closeModal(Modal.MarketNotLiquid)
}
</script>

<template>
  <AppModal
    :is-open="modalStore.modals[Modal.MarketNotLiquid]"
    is-sm
    @modal:closed="onCloseModal"
  >
    <template #title>
      <h3 class="text-base">
        {{ $t('marketNotLiquid.title', { slug }) }}
      </h3>
    </template>

    <p class="text-sm sm-3">
      {{
        $t('marketNotLiquid.description', {
          content: $t(`marketNotLiquid.${notLiquidMarket.slug}-description`),
          slug
        })
      }}
    </p>

    <div class="relative">
      <div class="mt-6 flex flex-col gap-4">
        <NuxtLink
          :to="{
            name: TradeSubPage.Spot,
            params: { spot: notLiquidMarket.redirectionSlug }
          }"
        >
          <AppButton is-lg class="w-full bg-blue-500 text-blue-900">
            <span class="font-semibold uppercase">
              {{
                $t('marketNotLiquid.cta', {
                  slug: redirectionSlug
                })
              }}
            </span>
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </AppModal>
</template>

<script lang="ts" setup>
import { toJpeg } from 'html-to-image'
import { Wallet } from '@injectivelabs/wallet-base'
import { trackSharePnlDownload } from '@/app/providers/mixpanel/EventTracker'
import { Modal } from '@/types'
import type { PositionV2 } from '@injectivelabs/sdk-ts'

const now = useNow({ interval: 1000 })
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    position: PositionV2
  }>(),
  {}
)

const emit = defineEmits<{
  'on:close': []
}>()

const { market } = useDerivativePosition(computed(() => props.position))

const characterList = [
  {
    key: 'char1',
    image: '/images/modal/share-pnl/mini/char1.webp'
  },
  {
    key: 'char2',
    image: '/images/modal/share-pnl/mini/char2.webp'
  },
  {
    key: 'char3',
    image: '/images/modal/share-pnl/mini/char3.webp'
  },
  {
    key: 'char4',
    image: '/images/modal/share-pnl/mini/char4.webp'
  },
  {
    key: 'char5',
    image: '/images/modal/share-pnl/mini/char5.webp'
  },
  {
    key: 'char6',
    image: '/images/modal/share-pnl/mini/char6.webp'
  },
  {
    key: 'char7',
    image: '/images/modal/share-pnl/mini/char7.webp'
  }
]

const canvas = ref()
const isDownloading = ref(false)
const selectedCharacter = ref('char1')

const downloadIsUnsupported = computed(
  () =>
    !lg.value &&
    (sharedWalletStore.wallet === Wallet.Keplr ||
      sharedWalletStore.wallet === Wallet.Metamask)
)

onMounted(() => {
  trackSharePnlDownload({
    isModalShown: true,
    isDownloadClicked: false,
    walletAddress: sharedWalletStore.injectiveAddress
  })
})

function onCloseModal() {
  emit('on:close')
  modalStore.closeModal(Modal.SharePositionPnl)
}

function onOptionSelect(key: string) {
  selectedCharacter.value = key
}

async function downloadImage() {
  isDownloading.value = true

  await nextTick()

  toJpeg(canvas.value).then((dataUrl) => {
    const link = document.createElement('a')
    link.download = `Position-PNL-${now.value}.jpeg`
    link.href = dataUrl
    link.click()

    trackSharePnlDownload({
      isModalShown: true,
      isDownloadClicked: true,
      walletAddress: sharedWalletStore.injectiveAddress
    })

    isDownloading.value = false
    onCloseModal()
  })
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.SharePositionPnl]"
    v-bind="{
      isLg: true,
      isAlwaysOpen: isDownloading,
      cardUi: { body: { padding: 'max-sm:px-4 p-6' } },
      ui: {
        overlay: { base: 'backdrop-filter backdrop-blur' },
        width: 'max-sm:w-full sm:w-[560px] sm:max-w-full max-sm:h-full'
      }
    }"
    @on:close="onCloseModal"
  >
    <h3 class="mb-5 text-xl sm:text-2xl font-semibold leading-none">
      {{ $t('trade.sharePnl') }}
    </h3>

    <section v-if="market" ref="canvas">
      <ModalsSharePositionPnlCanvasContent
        v-bind="{
          position,
          isLoading: isDownloading,
          selectedCharacter: selectedCharacter
        }"
      />
    </section>

    <div class="flex gap-5 mt-6 mb-10 flex-wrap">
      <ModalsSharePositionPnlCharacterOption
        v-for="character in characterList"
        :key="character.key"
        v-bind="{
          itemKey: character.key,
          itemImage: character.image,
          selectedCharacter: selectedCharacter
        }"
        @option:select="onOptionSelect"
      />
    </div>

    <div class="flex justify-end">
      <p v-if="downloadIsUnsupported" class="text-sm">
        {{ $t('trade.sharePnlModal.mobileDownloadNote') }}
      </p>

      <AppButton
        v-else
        variant="primary"
        :is-loading="isDownloading"
        class="px-6 py-2 text-sm font-medium rounded-lg bg-azure-blue-350 hover:bg-azure-blue-350/80 transition-colors ring-0"
        @click="downloadImage"
      >
        {{ $t('common.download') }}
      </AppButton>
    </div>
  </AppModal>
</template>

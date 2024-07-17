<script lang="ts" setup>
import { getExplorerUrl } from '@shared/utils/network'
import { Status, StatusType } from '@injectivelabs/utils'
import { getSwapAmountAndTokenFromTxHash } from '@/app/client/utils/explorer'
import { Modal } from '@/types'

const modalStore = useModalStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const props = defineProps({
  txHash: {
    type: String,
    required: true
  }
})

const status: Status = reactive(new Status(StatusType.Idle))
const swapInfo = ref(undefined as Record<string, string> | undefined)

const isModalOpen = computed<boolean>(
  () => modalStore.modals[Modal.SwapSuccess]
)

const explorerUrl = computed(() => {
  if (!props.txHash) {
    return undefined
  }

  return `${getExplorerUrl()}/transaction/${props.txHash}`
})

function closeModal() {
  modalStore.closeModal(Modal.SwapSuccess)
}

function onModalClose() {
  closeModal()
}

watch(isModalOpen, (isModalOpen: boolean) => {
  if (!isModalOpen) {
    return
  }

  status.setLoading()

  getSwapAmountAndTokenFromTxHash(props.txHash)
    .then((swapResults) => {
      swapInfo.value = swapResults
    })
    .catch((error) => {
      $onError(error)
    })
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppModal :is-open="isModalOpen" is-sm @modal:closed="onModalClose">
    <AppHocLoading v-bind="{ status }">
      <div class="text-center relative p-8">
        <SharedRainConfetti class="absolute inset-0 h-48 -mt-9 w-full" />

        <AppLottie
          v-bind="{ name: 'circle-check-border' }"
          class="mx-auto mt-2 mb-4 h-12 w-12 text-blue-500"
        />

        <h2 class="mb-1 text-2xl font-semibold leading-7">
          {{ t('trade.swap.swappedSuccessfully') }}
        </h2>
        <p class="text-gray-400">
          <span v-if="swapInfo">
            {{
              $t('trade.swap.youHaveSwapped', {
                inputAmount: swapInfo?.inputAmount,
                inputTokenSymbol: swapInfo?.inputTokenSymbol,
                outputAmount: swapInfo?.outputAmount,
                outputTokenSymbol: swapInfo?.outputTokenSymbol
              })
            }}
          </span>
        </p>

        <div v-if="explorerUrl" class="mt-2 text-center">
          <NuxtLink
            :to="explorerUrl"
            class="text-blue-500 hover:opacity-80 text-base leading-5"
            target="_blank"
          >
            <span>{{ $t('trade.swap.viewTransaction') }}</span>
          </NuxtLink>
        </div>

        <AppButton
          class="mx-auto mt-6 bg-blue-500 hover:bg-opacity-80 text-blue-900"
          is-md
          @click="onModalClose"
        >
          {{ $t('trade.swap.backToSwap') }}
        </AppButton>
      </div>
    </AppHocLoading>
  </AppModal>
</template>

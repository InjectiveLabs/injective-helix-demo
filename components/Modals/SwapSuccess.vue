<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { getExplorerUrl } from '@injectivelabs/sdk-ui-ts'
import { Modal } from '@/types'
import { NETWORK } from '@/app/utils/constants'
import { getSwapAmountAndTokenFromTxHash } from '@/app/client/utils/swap'
import { confettiOptions } from '@/app/utils/vendor'

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

const showModal = computed<boolean>(() => modalStore.modals[Modal.SwapSuccess])

const explorerUrl = computed(() => {
  if (!props.txHash) {
    return undefined
  }

  return `${getExplorerUrl(NETWORK)}/transaction/${props.txHash}`
})

function close() {
  modalStore.closeModal(Modal.SwapSuccess)
}

watch(showModal, (showModalState: boolean) => {
  if (!showModalState) {
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
  <AppModal :show="showModal" sm @modal:closed="close">
    <AppHocLoading v-bind="{ status }">
      <div class="text-center relative">
        <AppFlexibleConfetti
          class="absolute inset-0 h-48 -mt-9 w-full"
          v-bind="{ confettiOptions }"
        />

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
          md
          @click="close"
        >
          {{ $t('trade.swap.backToSwap') }}
        </AppButton>
      </div>
    </AppHocLoading>
  </AppModal>
</template>

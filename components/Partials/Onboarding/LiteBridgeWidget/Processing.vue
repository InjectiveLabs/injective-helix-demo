<script setup lang="ts">
import { usdtToken } from '@shared/data/token'
import { BigNumberInBase } from '@injectivelabs/utils'
import { getBridgeRedirectionUrl } from '@/app/utils/network'

const accountStore = useAccountStore()
const { t } = useLang()

const emit = defineEmits<{
  'transfer:success': []
  close: []
}>()

const countdown = ref(60)
const showMessage = ref(false)

const formattedCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

let interval: NodeJS.Timeout

onMounted(() => {
  interval = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(interval)
      showMessage.value = true
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})

watch(
  () => accountStore.bankBalances,
  (bankBalances) => {
    const usdtBalance = bankBalances.find(
      (balance) => balance.denom === usdtToken.denom
    )

    if (usdtBalance && new BigNumberInBase(usdtBalance.amount).gt(0)) {
      emit('transfer:success')
    }
  }
)

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center space-y-4 py-10">
    <img src="/svg/paper-plane.svg" class="max-w-[200px] w-full mx-auto" />
    <p class="text-xl font-semibold">
      {{ $t('onboarding.processing') }}
    </p>
    <p class="text-2xl">{{ formattedCountdown }}s</p>

    <p v-if="showMessage" class="text-sm mt-2 text-center text-coolGray-500">
      {{ $t('onboarding.processingMessage') }}
    </p>

    <p class="text-sm text-coolGray-300">
      <span>{{ $t('onboarding.processingMessageInfo') }}</span>
      {{ ' ' }}
      <NuxtLink
        class="text-blue-500 hover:underline"
        :external="true"
        target="_blank"
        :to="getBridgeRedirectionUrl()"
      >
        {{ $t('onboarding.injectiveBridge') }}.
      </NuxtLink>
    </p>

    <div class="w-full">
      <AppButton class="mt-4 -mb-8 w-full" @click="handleClose">
        {{ t('onboarding.closeAndContinue') }}
      </AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usdtToken } from '@shared/data/token'

const accountStore = useAccountStore()

const emit = defineEmits<{
  'transfer:success': []
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

    if (usdtBalance && Number(usdtBalance.amount) > 0) {
      emit('transfer:success')
    }
  }
)
</script>

<template>
  <div class="flex flex-col items-center justify-center space-y-4 py-10">
    <img src="/svg/paper-plane.svg" class="max-w-[200px] w-full mx-auto" />
    <p class="text-xl font-semibold">
      {{ $t('onboarding.processing') }}
    </p>
    <p class="text-2xl">{{ formattedCountdown }}s</p>

    <p v-if="showMessage" class="text-sm mt-2 text-center text-gray-500">
      {{ $t('onboarding.processingMessage') }}
    </p>
  </div>
</template>

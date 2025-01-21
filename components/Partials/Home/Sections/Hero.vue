<script setup lang="ts">
import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { Modal, TradeSubPage } from '@/types'

const appStore = useAppStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()

onMounted(() => {
  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px)', () => {
    gsap.from('#hero-section', {
      opacity: 0,
      filter: 'blur(10px)',
      duration: 2,
      delay: 0.2,
      scale: 1.2
    })

    gsap.utils.toArray('.gsap-text').forEach((text, _i, arr) => {
      gsap.to(text as HTMLElement, {
        scrollTrigger: {
          trigger: text as HTMLElement,
          start: 'clamp(50px 40%)',
          end: 'clamp(bottom 0%)',
          scrub: 2
        },
        y: arr.length * -40,
        scale: 1.2,
        filter: 'blur(10px)',
        opacity: 0,
        duration: 1
      })
    })
  })
})

function openDepositQrModal() {
  if (sharedWalletStore.isUserConnected) {
    modalStore.openModal(Modal.FiatOnboard)
  } else {
    onWalletConnect()
  }
}

function onWalletConnect() {
  if (GEO_IP_RESTRICTIONS_ENABLED && !appStore.userState.hasAcceptedTerms) {
    modalStore.openModal(Modal.Terms)
  } else {
    modalStore.openModal(Modal.Connect)
  }
}
</script>

<template>
  <div
    class="lg:h-screen flex flex-col lg:justify-center max-lg:py-10 relative gsap-section z-30"
  >
    <div id="hero-section" class="max-w-4xl mx-auto w-full text-center">
      <h1 id="hero-title" class="font-semibold gsap-text mb-5">
        <p class="text-2xl lg:text-7xl">
          {{ $t('home.openFinance') + ' ' }}
        </p>
        <p
          class="text-blue-500 text-2xl lg:text-[128px] font-bold leading-none"
        >
          {{ $t('home.reimagined') }}
        </p>
      </h1>

      <p id="hero-description" class="text-lg font-semibold gsap-text">
        {{ $t('home.description') }}
      </p>

      <div class="flex justify-center gap-4 mt-10 gsap-text">
        <NuxtLink
          :to="{ name: TradeSubPage.Spot, params: { slug: 'inj-usdt' } }"
        >
          <AppButton class="w-full">
            {{ $t('home.startTrading') }}
          </AppButton>
        </NuxtLink>

        <AppButton
          class="w-full isolate"
          variant="primary-outline"
          @click="openDepositQrModal"
        >
          {{ $t('home.depositCrypto') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { generateOnramperSignature } from '@/app/utils/helpers'
import { trackOnramperSeen } from '@/app/providers/mixpanel/EventTracker'
import {
  ONRAMPER_API_KEY,
  ONRAMPER_SIGNING_KEY,
  IS_ONRAMPER_DEV_MODE
} from '@/app/utils/constants'

const siteFullUrl = useRequestURL()
const sharedWalletStore = useSharedWalletStore()

const onramperUrl = computed(() => {
  const siteUrl = siteFullUrl?.href || 'https://helixapp.com'
  const signContent = `wallets=inj_injective:${sharedWalletStore.injectiveAddress}`
  const signature = generateOnramperSignature(ONRAMPER_SIGNING_KEY, signContent)

  const theme = {
    themeName: 'dark',
    containerColor: '#14151A',
    primaryTextColor: '#FFFFFF',
    secondaryTextColor: '#FFFFFF',
    primaryBtnTextColor: '#FFFFFF'
  }

  const options = {
    defaultFiat: 'usd',
    defaultAmount: 100,
    apiKey: ONRAMPER_API_KEY,
    onlyCryptos: 'inj_injective',
    successRedirectUrl: `${siteUrl}?onramper_status=success`
  }

  const onramperUrl = new URL(
    `https://buy.onramper.${IS_ONRAMPER_DEV_MODE ? 'dev' : 'com'}`
  )

  onramperUrl.searchParams.set(
    'wallets',
    `inj_injective:${sharedWalletStore.injectiveAddress}`
  )

  for (const [key, value] of Object.entries(options)) {
    onramperUrl.searchParams.set(key, value.toString())
  }

  for (const [key, value] of Object.entries(theme)) {
    onramperUrl.searchParams.set(key, value.replace('#', ''))
  }

  const signedUrl = `${onramperUrl.toString()}&signature=${signature}`

  return signedUrl
})

onMounted(() => trackOnramperSeen(sharedWalletStore.injectiveAddress))
</script>

<template>
  <div
    class="overflow-hidden max-w-[36rem] w-full sm:h-[630px] max-sm:h-[70vh] my-6"
  >
    <iframe
      :src="onramperUrl"
      width="100%"
      height="100%"
      title="Helix Fiat Onboarding Widget"
      allow="accelerometer; autoplay; camera; gyroscope; payment; microphone"
    />
  </div>
</template>

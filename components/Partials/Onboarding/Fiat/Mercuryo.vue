<script setup lang="ts">
import { computeSHA512 } from '@/app/utils/helpers'
import { MERCURYO_KEY, MERCURYO_WIDGET_ID } from '@/app/utils/constants'

declare let mercuryoWidget: any

const walletStore = useSharedWalletStore()

onMounted(async () => {
  const host = document.getElementById('mercuryo-widget')

  if (!host) {
    return
  }

  const signature = await computeSHA512(
    `${walletStore.injectiveAddress}${MERCURYO_KEY}`
  )

  mercuryoWidget.run({
    widgetId: MERCURYO_WIDGET_ID,
    host,
    height: '720px',
    theme: 'INJBridge',
    networks: ['INJECTIVE'],
    address: walletStore.injectiveAddress,
    signature
  })
})
</script>

<template>
  <div class="overflow-hidden">
    <div id="mercuryo-widget" class="max-w-[36rem] w-full -mt-[50px] mx-auto" />
  </div>
</template>

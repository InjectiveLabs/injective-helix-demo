<script setup lang="ts">
import { TradeSubPage } from '@/types'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  router.replace({
    name: TradeSubPage.Futures,
    params: {
      slug: route.params.slug
    }
  })
})
</script>

<template>
  <div>Perp Trading Bots WIP</div>
</template>

<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { spotGridMarkets } from '@/app/json'
import { UiSpotMarket } from '@/types'

const campaignStore = useCampaignStore()
const { $onError } = useNuxtApp()

const props = withDefaults(defineProps<{ market: UiSpotMarket }>(), {})

const activeBots = ref<number>(0)
const status = reactive(new Status(StatusType.Loading))

const sgtScAddress = computed(() => {
  const scAddress =
    spotGridMarkets.find((sgt) => sgt.slug === props.market.slug)
      ?.contractAddress || ''

  return scAddress
})

onMounted(() => {
  campaignStore
    .fetchActiveStrategiesOnSmartContract(sgtScAddress.value)
    .then((response) => {
      activeBots.value = response
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <div class="text-right">
    <span v-if="status.isLoading()" class="text-coolGray-500">&mdash;</span>
    <span v-else class="font-mono"> {{ activeBots }}</span>
  </div>
</template>

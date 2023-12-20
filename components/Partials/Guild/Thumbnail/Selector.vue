<script lang="ts" setup>
import { thumbnailMap } from '@/app/data/campaign'

const campaignStore = useCampaignStore()

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  'update:modelValue': [state: string]
}>()

const thumbnailList = computed(() => {
  const logos = campaignStore.guildsByTVL.map(({ logo }) => logo)

  return Object.keys(thumbnailMap).filter((logoId) => !logos.includes(logoId))
})

const selectedValue = computed({
  get: (): string | undefined => props.modelValue,
  set: (value?: string) => {
    if (value) {
      emit('update:modelValue', value)
    }
  }
})
</script>

<template>
  <div class="flex items-center gap-4 mt-2 flex-wrap">
    <PartialsGuildThumbnailItem
      v-for="value in thumbnailList"
      :key="value"
      v-model="selectedValue"
      v-bind="{
        value
      }"
    />
  </div>
</template>

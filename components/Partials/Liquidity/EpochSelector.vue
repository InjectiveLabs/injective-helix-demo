<script setup lang="ts">
import { LP_EPOCHS } from '@/app/data/guild'

const { t } = useLang()

// WE WILL USE THIS LATER - WE HAVE TO HARDCODE 1 FOR NOW BELOW
// const latestEpoch = Math.max(...LP_EPOCHS.map(({ epoch }) => epoch))

const epoch = useQueryRef('epoch', '1')

const epochOptions = computed(() =>
  LP_EPOCHS.filter(({ startDate }) => startDate < Date.now()).map((ep) => ({
    display: t('campaign.round', { round: ep.epoch }),
    value: ep.epoch.toString()
  }))
)
</script>

<template>
  <AppSelect
    v-model="epoch"
    start-placement
    v-bind="{
      options: epochOptions,
      wrapperClass: 'border px-4 py-1 rounded'
    }"
  >
    <template #default="{ selected }">
      <span class="font-bold select-none">
        {{ selected?.display }}
      </span>
    </template>

    <template #option="{ option }">
      <span class="font-bold">
        {{ option.display }}
      </span>
    </template>
  </AppSelect>
</template>

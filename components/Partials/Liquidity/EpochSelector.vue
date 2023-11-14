<script setup lang="ts">
import { WritableComputedRef } from 'nuxt/dist/app/compat/capi'
import { LP_EPOCHS } from '@/app/data/guild'

const latestEpoch = Math.max(...LP_EPOCHS.map(({ epoch }) => epoch))

const epoch = useQueryRef(
  'epoch',
  latestEpoch.toString()
) as WritableComputedRef<string>

const epochOptions = computed(() =>
  LP_EPOCHS.filter(({ startDate }) => startDate < Date.now()).map((ep) => ({
    display: `Epoch ${ep.epoch}`,
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

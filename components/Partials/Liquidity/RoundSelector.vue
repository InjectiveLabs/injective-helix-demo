<script lang="ts" setup>
import { CAMPAIGN_LP_ROUNDS } from '@/app/data/campaign'
import { DEFAULT_LP_ROUND } from '@/app/utils/constants'

const { t } = useLang()

const round = useQueryRef('round', DEFAULT_LP_ROUND)

const roundOptions = computed(() =>
  CAMPAIGN_LP_ROUNDS.map(({ round }) => ({
    display: t('campaign.round', { round }),
    value: round.toString()
  }))
)
</script>

<template>
  <AppSelect
    v-model="round"
    start-placement
    v-bind="{
      options: roundOptions,
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

<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotGridTradingForm, spotMarketKey } from '~/types'

const market = inject(spotMarketKey)

const validate = useValidateForm()
const spotFormValues = useFormValues<SpotGridTradingForm>()
const gridStrategyStore = useGridStrategyStore()

const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()

async function createStrategy() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  status.setLoading()

  gridStrategyStore
    .createStrategy(spotFormValues.value, market!.value!)
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div class="py-4">
    <AppButton class="w-full" v-bind="{ status }" @click="createStrategy">
      {{ $t('sgt.create') }}
    </AppButton>
  </div>
</template>

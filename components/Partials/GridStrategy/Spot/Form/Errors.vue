<script setup lang="ts">
import { SpotGridTradingForm } from '@/types'

const formErrors = useFormErrors<SpotGridTradingForm>()
</script>

<template>
  <div>
    {{ formErrors }}
  </div>
</template>

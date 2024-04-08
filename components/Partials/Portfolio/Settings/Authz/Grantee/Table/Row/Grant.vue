<script setup lang="ts">
import { GrantAuthorization } from '@injectivelabs/sdk-ts'

const props = defineProps({
  grant: {
    type: Object as PropType<GrantAuthorization>,
    required: true
  }
})

const authorizationFormatted = computed(
  () => String(props.grant.authorization).split('.').slice(-1)[0]
)
</script>

<template>
  <div class="flex p-2 text-xs hover:bg-brand-875">
    <div class="flex-[2] px-4"></div>
    <div class="flex-1 p-2 min-w-0 truncate font-semibold">
      &bull; {{ authorizationFormatted }}
    </div>
    <div class="flex-1 p-2">
      <AppButton variant="danger-ghost" size="sm">Revoke</AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  GrantAuthorizationType,
  GrantAuthorizationWithDecodedAuthorization
} from '@injectivelabs/sdk-ts'

const props = defineProps({
  grant: {
    type: Object as PropType<GrantAuthorizationWithDecodedAuthorization>,
    required: true
  }
})

const authorizationFormatted = computed(() => {
  if (
    props.grant.authorization &&
    props.grant.authorizationType.includes(
      GrantAuthorizationType.GenericAuthorization
    )
  ) {
    return props.grant.authorization.msg.split('.').reverse()[0]
  }
})
</script>

<template>
  <div class="flex p-2 text-xs hover:bg-brand-875">
    <div class="flex-[2] px-4"></div>
    <div class="flex-[2] p-2 min-w-0 truncate font-semibold">
      &bull; {{ authorizationFormatted }}
    </div>
  </div>
</template>

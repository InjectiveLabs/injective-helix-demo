<script setup lang="ts">
import {
  GrantAuthorizationWithDecodedAuthorization,
  GrantAuthorizationType
} from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'

const authZStore = useAuthZStore()
const { $onError } = useNuxtApp()

const props = defineProps({
  grant: {
    type: Object as PropType<GrantAuthorizationWithDecodedAuthorization>,
    required: true
  }
})

const status = reactive(new Status(StatusType.Idle))

const authorizationFormatted = computed(() => {
  if (
    props.grant.authorization &&
    props.grant.authorizationType.includes(
      GrantAuthorizationType.GenericAuthorization
    )
  ) {
    return props.grant.authorization.msg
  }
})

function revoke() {
  if (!authorizationFormatted.value) {
    return
  }

  status.setLoading()

  authZStore
    .revokeAuthorization({
      grantee: props.grant.grantee,
      messageTypes: [authorizationFormatted.value]
    })
    .then(() => {
      //
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div class="flex p-2 text-xs hover:bg-brand-875">
    <div class="flex-[2] px-4"></div>
    <div class="flex-1 p-2 min-w-0 truncate font-semibold">
      &bull; {{ authorizationFormatted }}
    </div>
    <div class="flex-1 p-2">
      <AppButton
        variant="danger-ghost"
        size="sm"
        :status="status"
        @click="revoke"
      >
        Revoke
      </AppButton>
    </div>
  </div>
</template>

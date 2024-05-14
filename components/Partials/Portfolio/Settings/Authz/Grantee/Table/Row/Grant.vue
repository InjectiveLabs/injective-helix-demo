<script setup lang="ts">
import { GrantAuthorization } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'

const authZStore = useAuthZStore()
const { $onError } = useNuxtApp()

const props = defineProps({
  grant: {
    type: Object as PropType<GrantAuthorization>,
    required: true
  }
})

const status = reactive(new Status(StatusType.Idle))

const authorizationFormatted = computed(
  () => String(props.grant.authorization).split('.').slice(-1)[0]
)

function revoke() {
  status.setLoading()

  authZStore
    .revokeAuthorization({
      grantee: props.grant.grantee,
      messageTypes: [
        (props.grant.authorization as unknown as string).split('/')[1]
      ]
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

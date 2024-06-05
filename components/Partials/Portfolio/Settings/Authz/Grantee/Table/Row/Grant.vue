<script setup lang="ts">
import {
  GenericAuthorization,
  GrantAuthorizationType,
  GrantAuthorizationWithDecodedAuthorization
} from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'

const authZStore = useAuthZStore()
const walletStore = useWalletStore()
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
    return props.grant.authorization.msg.split('.').reverse()[0]
  }
})

function revoke() {
  if (!authorizationFormatted.value) {
    return
  }

  status.setLoading()

  if (
    props.grant.authorization &&
    !props.grant.authorizationType.includes(
      GrantAuthorizationType.GenericAuthorization
    )
  ) {
    return
  }

  authZStore
    .revokeAuthorization({
      grantee: props.grant.grantee,
      messageTypes: [(props.grant.authorization as GenericAuthorization).msg]
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div class="flex p-2 text-xs hover:bg-brand-875">
    <div class="flex-[3] p-2 pr-8 min-w-0 truncate font-semibold">
      &bull; {{ authorizationFormatted }}
    </div>
    <div class="flex-1 p-2">
      <AppButton
        v-if="
          walletStore.isAutoSignEnabled || walletStore.isAuthzWalletConnected
        "
        variant="danger-ghost"
        size="sm"
        disabled
        :tooltip="$t('common.notAvailableinAuthZOrAutoSignMode')"
      >
        {{ $t('portfolio.settings.authz.revoke') }}
      </AppButton>

      <AppButton
        v-else
        variant="danger-ghost"
        size="sm"
        :status="status"
        @click="revoke"
      >
        {{ $t('portfolio.settings.authz.revoke') }}
      </AppButton>
    </div>
  </div>
</template>

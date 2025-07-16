<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { GrantAuthorizationType } from '@injectivelabs/sdk-ts'
import type {
  GenericAuthorization,
  GrantAuthorizationWithDecodedAuthorization
} from '@injectivelabs/sdk-ts'

const authZStore = useAuthZStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    grant: GrantAuthorizationWithDecodedAuthorization
  }>(),
  {}
)

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

  return ''
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
    .then(() => {
      notificationStore.update({ title: t('toast.success') })
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
          sharedWalletStore.isAutoSignEnabled ||
          sharedWalletStore.isAuthzWalletConnected
        "
        variant="danger-ghost"
        size="sm"
        disabled
        :tooltip="$t('portfolio.notAvailableinAuthZOrAutoSignMode')"
      >
        {{ $t('portfolio.authZ.revoke') }}
      </AppButton>

      <AppButton
        v-else
        variant="danger-ghost"
        size="sm"
        :status="status"
        @click="revoke"
      >
        {{ $t('portfolio.authZ.revoke') }}
      </AppButton>
    </div>
  </div>
</template>

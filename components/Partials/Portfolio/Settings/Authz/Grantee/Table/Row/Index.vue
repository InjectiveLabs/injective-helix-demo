<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { GrantAuthorizationType } from '@injectivelabs/sdk-ts'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { DEFAULT_TRUNCATE_LENGTH } from '@/app/utils/constants'
import type {
  GenericAuthorization,
  GrantAuthorizationWithDecodedAuthorization
} from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    grantee: string
    grants: GrantAuthorizationWithDecodedAuthorization[]
  }>(),
  {}
)

const authZStore = useAuthZStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const isOpen = ref(false)
const status = reactive(new Status(StatusType.Idle))

function toggle() {
  isOpen.value = !isOpen.value
}

function revokeAll() {
  status.setLoading()

  authZStore
    .revokeAuthorization({
      grantee: props.grantee,
      messageTypes: props.grants
        .filter(
          (grant) =>
            /** TODO: filter other types of authorization when we add them */
            grant.authorization &&
            grant.authorizationType.includes(
              GrantAuthorizationType.GenericAuthorization
            )
        )
        .map((grant) => (grant.authorization as GenericAuthorization).msg)
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
    <div class="flex-1 flex items-center p-2 truncate min-w-0">
      <span class="font-mono truncate min-w-0">
        {{ sharedEllipsisFormatText(grantee, DEFAULT_TRUNCATE_LENGTH) }}
      </span>
    </div>

    <div class="xs:flex-1 max-xs:w-10 flex items-center p-2">
      {{ grants.length }}
    </div>

    <div
      class="flex-1 flex items-center p-2 space-x-2 hover:text-blue-500 rounded-md cursor-pointer select-none"
      @click="toggle"
    >
      <span class="transition-transform" :class="{ 'rotate-180': isOpen }">
        <UIcon :name="NuxtUiIcons.ChevronDown" class="h-3 w-3 min-w-3" />
      </span>

      <span> {{ $t('portfolio.authZ.viewGrantedFunctions') }} </span>
    </div>

    <div class="xs:flex-1 flex items-center p-2" @click.stop>
      <AppButton
        v-if="
          sharedWalletStore.isAuthzWalletConnected ||
          sharedWalletStore.isAutoSignEnabled
        "
        v-bind="{ status }"
        size="sm"
        disabled
        variant="danger-ghost"
        class="text-nowrap px-2"
        :tooltip="$t('portfolio.notAvailableinAuthZOrAutoSignMode')"
      >
        {{ $t('portfolio.authZ.revokeAll') }}
      </AppButton>

      <AppButton
        v-else
        v-bind="{ status }"
        size="sm"
        variant="danger-ghost"
        class="text-nowrap px-2"
        @click="revokeAll"
      >
        {{ $t('portfolio.authZ.revokeAll') }}
      </AppButton>
    </div>
  </div>

  <AppCollapse :wrapper-classes="'divide-y bg-black/30'" v-bind="{ isOpen }">
    <PartialsPortfolioSettingsAuthzGranteeTableRowGrant
      v-for="grant in grants"
      v-bind="{ grant }"
      :key="`${grant.authorizationType}-${grant.grantee}-${grant.granter}`"
    />
  </AppCollapse>
</template>

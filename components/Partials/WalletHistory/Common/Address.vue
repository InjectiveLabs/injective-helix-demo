<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'

const props = withDefaults(
  defineProps<{
    isSm?: boolean
    isXs?: boolean
    address: string
  }>(),
  {
    isSm: false,
    isXs: false
  }
)

const notificationStore = useSharedNotificationStore()
const { copy } = useClipboard()
const { t } = useLang()

function copyAddress() {
  copy(props.address).then(() =>
    notificationStore.success({
      title: t('toast.addressCopied')
    })
  )
}
</script>

<template>
  <div class="flex items-center">
    <span class="tracking-tight" :class="{ 'text-xs': isXs, 'text-sm': isSm }">
      <slot />
    </span>

    <div
      class="cursor-pointer flex items-center text-coolGray-500 pl-2 hover:text-blue-500"
      @click="copyAddress"
    >
      <UIcon :name="NuxtUiIcons.Copy2" class="w-4 h-4" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  isSm: Boolean,
  isXs: Boolean,

  address: {
    type: String,
    required: true
  }
})

const notificationStore = useSharedNotificationStore()
const { copy } = useClipboard()
const { t } = useLang()

function copyAddress() {
  copy(props.address).then(() =>
    notificationStore.success({
      title: t('connect.addressCopied')
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
      class="cursor-pointer flex items-center text-gray-500 pl-2 hover:text-blue-500"
      @click="copyAddress"
    >
      <SharedIcon name="copy-plain" class="w-4 h-4" />
    </div>
  </div>
</template>

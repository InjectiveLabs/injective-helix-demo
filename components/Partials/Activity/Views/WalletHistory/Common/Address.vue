<script lang="ts" setup>
const props = defineProps({
  sm: Boolean,
  xs: Boolean,

  address: {
    type: String,
    required: true
  }
})

const { success } = useNotifications()
const { copy } = useClipboard()
const { t } = useLang()

function handleCopy() {
  copy(props.address).then(() => {
    success({
      title: t('connect.addressCopied')
    })
  })
}
</script>

<template>
  <div class="flex items-center">
    <span class="tracking-tight" :class="{ 'text-xs': xs, 'text-sm': sm }">
      <slot />
    </span>

    <div
      class="cursor-pointer text-gray-500 pl-2 pt-1 hover:text-blue-500"
      @click="handleCopy"
    >
      <BaseIcon name="copy-plain" class="w-4 h-4" />
    </div>
  </div>
</template>

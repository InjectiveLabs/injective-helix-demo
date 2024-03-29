<script lang="ts" setup>
const isVisible = ref(true)

function onClose() {
  isVisible.value = false
}
</script>

<template>
  <ClientOnly v-if="isVisible">
    <Teleport to="#legacy-wormhole-banner">
      <div
        class="w-full py-3 px-4 text-gray-925 font-medium bg-orange-200 flex justify-between items-start text-sm leading-6"
      >
        <div class="w-full">
          <slot />
        </div>

        <slot v-if="$slots['add-on']" name="add-on" />

        <BaseIcon
          name="close"
          class="w-4 h-4 min-w-4 font-normal mt-1 ml-4"
          @click="onClose"
        />
      </div>
    </Teleport>
  </ClientOnly>
</template>

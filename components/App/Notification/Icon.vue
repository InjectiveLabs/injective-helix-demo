<script lang="ts" setup>
import { NuxtUiIcons, NotificationType } from '@shared/types'

withDefaults(
  defineProps<{
    notificationType: string
  }>(),
  {}
)
</script>

<template>
  <div v-if="notificationType === NotificationType.Error">
    <slot name="error">
      <UIcon
        :name="NuxtUiIcons.WarningOutline"
        class="block size-6 text-red-500"
      />
    </slot>
  </div>
  <div v-if="notificationType === NotificationType.Warning">
    <slot name="warning">
      <UIcon
        :name="NuxtUiIcons.WarningOutline"
        class="block size-6 text-orange-400"
      />
    </slot>
  </div>
  <div v-if="notificationType === NotificationType.Success">
    <slot name="success">
      <UIcon
        :name="NuxtUiIcons.CheckmarkOutline"
        class="block size-6 text-green-400"
      />
    </slot>
  </div>
  <div v-if="notificationType === NotificationType.Info">
    <slot name="info">
      <UIcon :name="NuxtUiIcons.Info3" class="block size-6 text-primary-500" />
    </slot>
  </div>
</template>

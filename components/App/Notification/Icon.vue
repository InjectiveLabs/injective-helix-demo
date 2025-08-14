<script lang="ts" setup>
import { NuxtUiIcons, NotificationType } from '@shared/types'

withDefaults(
  defineProps<{
    icon?: string
    notificationType: string
  }>(),
  {
    icon: ''
  }
)
</script>

<template>
  <div v-if="notificationType === NotificationType.Error">
    <slot name="error">
      <UIcon
        :name="icon || NuxtUiIcons.WarningOutline"
        class="block size-6 text-red-500"
      />
    </slot>
  </div>
  <div v-if="notificationType === NotificationType.Warning">
    <slot name="warning">
      <UIcon
        :name="icon || NuxtUiIcons.WarningOutline"
        class="block size-6 text-orange-400"
      />
    </slot>
  </div>
  <div v-if="notificationType === NotificationType.Success">
    <slot name="success">
      <UIcon
        :name="icon || NuxtUiIcons.CheckmarkCircle"
        class="block size-6 text-green-400"
      />
    </slot>
  </div>
  <div v-if="notificationType === NotificationType.Info">
    <slot name="info">
      <UIcon
        :name="icon || NuxtUiIcons.Info3"
        class="block size-6 text-primary-500"
      />
    </slot>
  </div>
</template>

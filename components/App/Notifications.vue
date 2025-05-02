<script lang="ts" setup>
const notificationStore = useSharedNotificationStore()
</script>

<template>
  <section>
    <template
      v-for="notification in notificationStore.notifications"
      :key="`notification-${notification.id}`"
    >
      <slot :notification="notification">
        <AppNotification v-bind="{ notification }" />
      </slot>
    </template>
  </section>
</template>

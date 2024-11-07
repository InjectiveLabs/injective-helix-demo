<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
</script>

<template>
  <main>
    <PartialsInstitutionalNavbar />
    <slot />
    <PartialsInstitutionalFooter />

    <SharedNotifications
      class="z-[1110] fixed inset-0 flex flex-col gap-2 justify-end items-end p-6 pointer-events-none"
    >
      <template #default="{ notification }">
        <SharedNotification
          :notification="notification"
          class="pointer-events-auto bg-coolGray-800"
        >
          <template #close="{ closeNotification }">
            <UIcon
              :name="NuxtUiIcons.CloseBold"
              class="min-w-4 hover:text-blue-500 text-white w-4 h-4"
              @click="closeNotification"
            />
          </template>
        </SharedNotification>
      </template>
    </SharedNotifications>
  </main>
</template>

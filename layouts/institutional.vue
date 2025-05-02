<script setup lang="ts"></script>

<template>
  <main>
    <PartialsInstitutionalNavbar />
    <slot />
    <PartialsInstitutionalFooter />

    <AppNotifications
      class="z-[1110] fixed top-0 right-0 flex flex-col gap-2 p-6 pointer-events-none"
    />
  </main>
</template>

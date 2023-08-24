<script setup lang="ts">
import { IS_MAINNET, IS_STAGING } from '@/app/utils/constants'

definePageMeta({
  layout: 'institutional',
  middleware: [
    () => {
      if (IS_MAINNET && !IS_STAGING) {
        return navigateTo('/')
      }
    }
  ]
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-8 pb-40">
    <PartialsInstitutionalHero />
    <PartialsInstitutionalTrustedBy class="mb-20 lg:mb-32" />
    <PartialsInstitutionalBenefits class="mb-20 lg:mb-32" />
    <PartialsInstitutionalLearnMore />

    <ModalsInstitutionalForm />
  </div>
</template>

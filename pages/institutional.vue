<script lang="ts" setup>
definePageMeta({ layout: 'institutional' })
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

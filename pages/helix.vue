<script lang="ts" setup>
definePageMeta({
  layout: 'blank'
})

const countdownFrom = ref(5)

onMounted(() => {
  setIntervalForNow()
  redirectPage()
})

function setIntervalForNow() {
  setInterval(() => {
    countdownFrom.value = countdownFrom.value - 1
  }, 1000)
}

function redirectPage() {
  setTimeout(() => {
    const link = document.createElement('a')

    link.href = 'https://helixapp.com/'
    document.body.appendChild(link)
    link.click()
  }, countdownFrom.value * 1000)
}
</script>

<template>
  <div
    class="bg-[#000000] font-inter min-h-screen w-full flex items-center justify-center flex-col"
  >
    <h1 class="text-[32px] xs:text-[40px] font-bold tracking-wide">
      Injective Pro is now
    </h1>
    <div class="flex items-center gap-6 mt-4">
      <CommonHelixLogo class="h-[60px] w-20" />
      <CommonHelixLogoText class="block h-12 text-white" />
    </div>

    <h3 class="text-base leading-5 font-semibold mt-8 mb-8">
      Redirecting to Helixapp.com
      <span v-if="countdownFrom > 0">in {{ countdownFrom }}</span>
      ...
    </h3>

    <a href="https://helixapp.com/">
      <AppButton xl class="bg-blue-500 text-blue-900 w-60 hover:opacity-60">
        <span class="font-bold">Go to Helixapp.com</span>
      </AppButton>
    </a>
  </div>
</template>

<template>
  <div class="min-h-screen w-full flex justify-center flex-col items-center">
    <div class="flex items-center gap-5">
      <Logo class="h-16 w-16" />
      <LogoText class="block h-10 text-white" />
    </div>

    <h1 class="text-2xl xs:text-3xl leading-10 mt-8 mb-6">
      Sign up for early access
    </h1>

    <ValidationObserver v-slot="{ invalid }" ref="form">
      <ValidationProvider v-slot="{ errors }" name="email" :rules="`email`">
        <div class="w-80 xs:w-[360px] bg-gray-950 rounded-lg flex items-center">
          <VInput
            v-model="email"
            placeholder="Subscribe to get updates"
            dense
            transparent-bg
          >
          </VInput>

          <VButton
            slot="addon"
            class="bg-[#2891E9] p-4 h-12 text-sm cursor-pointer hover:bg-opacity-50 rounded-lg leading-4"
            :class="{
              'bg-opacity-50 text-white text-opacity-60':
                invalid || email.trim() === ''
            }"
            :disabled="invalid || email.trim() === ''"
            :status="status"
            @click="subscribe"
          >
            Submit
          </VButton>
        </div>
        <div v-if="errors.length > 0" class="mt-2">
          <span class="text-orange-500">{{ errors[0] }}</span>
        </div>
      </ValidationProvider>
    </ValidationObserver>

    <div class="flex items-center gap-4 mt-10 mb-20">
      <a
        class="w-6 h-6 text-white hover:text-primary-500"
        href="https://t.me/joininjective"
        target="_blank"
      >
        <IconTelegramCircle />
      </a>

      <a
        class="w-6 h-6 text-white hover:text-primary-500"
        href="https://twitter.com/HelixApp_"
        target="_blank"
      >
        <IconTwitter />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { subscribeToNewsLetter } from '~/app/services/newsLetter'
import Logo from '~/components/elements/logo.vue'
import LogoText from '~/components/elements/logo-text.vue'

export default Vue.extend({
  components: {
    Logo,
    LogoText,
    ValidationObserver,
    ValidationProvider
  },

  data() {
    return {
      status: new Status(),
      email: ''
    }
  },

  methods: {
    subscribe() {
      this.status.setLoading()

      subscribeToNewsLetter(this.email)
        .then(() => {
          this.$toast.success("You've successfully signed up for early access!")
        })
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>

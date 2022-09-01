<template>
  <div class="py-20 bg-gray-900 text-center">
    <h1 class="text-3xl font-semibold">{{ $t('newsLetter.title') }}</h1>

    <div class="max-w-[340px] xs:max-w-[360px] mt-6 mx-auto">
      <ValidationObserver v-slot="{ invalid }" ref="form">
        <ValidationProvider v-slot="{ errors }" name="email" :rules="`email`">
          <div class="bg-gray-950 rounded-lg flex items-center">
            <VInput
              v-model="email"
              :placeholder="$t('newsLetter.emailAddress')"
              dense
              transparent-bg
            >
            </VInput>

            <VButton
              slot="addon"
              class="bg-[#2891E9] p-4 h-12 text-sm cursor-pointer hover:bg-opacity-50 rounded-lg leading-4"
              :class="{
                'bg-opacity-50 text-white text-opacity-60':
                  invalid || !trimmedEmail
              }"
              :disabled="invalid || !trimmedEmail"
              :status="status"
              @click="subscribe"
            >
              {{ $t('newsLetter.subscribe') }}
            </VButton>
          </div>
          <div v-if="errors.length > 0" class="mt-2 text-left text-sm">
            <span class="text-orange-500">{{ errors[0] }}</span>
          </div>
        </ValidationProvider>
      </ValidationObserver>

      <div class="mt-6">
        <i18n
          path="newsLetter.disclaimerMessage"
          tag="p"
          class="text-xs text-gray-450"
        >
          <template #termsAndCondition>
            <a
              class="underline hover:text-primary-500"
              href="https://injectivelabs.org/terms-and-conditions"
              target="_blank"
            >
              {{ $t('newsLetter.termsAndCondition') }}
            </a>
          </template>

          <template #privacyPolicy>
            <a
              class="underline hover:text-primary-500"
              href="https://injectivelabs.org/privacy-policy"
              target="_blank"
            >
              {{ $t('newsLetter.privacyPolicy') }}
            </a>
          </template>

          <template #disclaimer>
            <a
              class="underline hover:text-primary-500"
              href="https://injective.com/disclaimer/"
              target="_blank"
            >
              {{ $t('newsLetter.disclaimer') }}
            </a>
          </template>
        </i18n>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { subscribeToNewsLetter } from '~/app/services/newsLetter'

export default Vue.extend({
  components: {
    ValidationObserver,
    ValidationProvider
  },

  data() {
    return {
      status: new Status(),
      email: ''
    }
  },

  computed: {
    trimmedEmail(): string {
      const { email } = this

      return email.trim()
    }
  },

  methods: {
    subscribe() {
      this.status.setLoading()

      subscribeToNewsLetter(this.email)
        .then(() => {
          this.$toast.success(this.$t('newsLetter.subscribeToast'))
          this.email = ''
        })
        .catch((e: any) => {
          this.$toast.error(e.message.replace('Error', ''))
        })
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>

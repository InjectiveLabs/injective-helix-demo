<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { subscribeToNewsletter } from '@/app/services/newsletter'
import { MainPage } from '@/types'

const { t } = useLang()
const notificationStore = useSharedNotificationStore()
const { handleSubmit, resetForm } = useForm()

const status = reactive(new Status(StatusType.Idle))

const { value, errors } = useStringField({
  name: 'email',
  rule: 'required|email'
})

const subscribe = handleSubmit((values) => {
  status.setLoading()

  subscribeToNewsletter(values.email)
    .then(() => {
      notificationStore.success({
        title: t('newsletter.subscribeToast')
      })

      resetForm()
    })
    .catch((e: any) => {
      notificationStore.error({ title: e.message.replace('Error', '') })
    })
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <div class="my-10 lg:my-20 py-40 text-center relative">
    <div class="relative z-20">
      <h1
        class="text-3xl font-semibold bg-gradient-to-r from-white to-coolGray-500 bg-clip-text text-transparent"
      >
        {{ $t('newsletter.title') }}
      </h1>

      <div class="max-w-[340px] xs:max-w-[360px] mt-6 mx-auto">
        <div class="rounded-lg flex space-x-2 items-center">
          <UInput
            v-model="value"
            size="xl"
            :placeholder="$t('newsletter.emailAddress')"
            :ui="{
              color: {
                white: {
                  outline: 'dark:bg-brand-800 focus:ring-1'
                }
              }
            }"
          />

          <SharedButton
            size="xl"
            :disabled="errors.length > 0"
            :loading="status.isLoading()"
            @click="subscribe"
          >
            <span class="text-sm">
              {{ $t('newsletter.subscribe') }}
            </span>
          </SharedButton>
        </div>
        <div
          v-if="errors.length > 0"
          class="mt-2 text-left text-sm capitalize-phrase"
        >
          <span class="text-red-500">{{ errors[0] }}</span>
        </div>

        <div class="mt-6">
          <i18n-t
            keypath="newsletter.disclaimerMessage"
            tag="p"
            class="text-xs text-coolGray-450"
          >
            <template #termsAndCondition>
              <NuxtLink
                target="_blank"
                class="underline hover:text-opacity-80"
                :to="{ name: MainPage.Terms }"
              >
                {{ $t('terms.termsAndCondition') }}
              </NuxtLink>
            </template>

            <template #privacyPolicy>
              <a
                class="underline hover:text-blue-500"
                href="https://injectivelabs.org/privacy"
                target="_blank"
              >
                {{ $t('newsletter.privacyPolicy') }}
              </a>
            </template>
          </i18n-t>
        </div>
      </div>
    </div>
  </div>
</template>

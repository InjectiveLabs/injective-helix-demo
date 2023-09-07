<script setup lang="ts">
import { Modal } from '@/types/enums'

const appStore = useAppStore()
const modalStore = useModalStore()

const el = ref<HTMLDivElement>()
const step = ref(1)

function onCloseModal() {
  modalStore.closeModal(Modal.SgtBanner)
  step.value = 1
}

onMounted(() => {
  if (!appStore.userState.modalsViewed.includes(Modal.SgtBanner)) {
    modalStore.openModal(Modal.SgtBanner)

    appStore.setUserState({
      ...appStore.userState,
      modalsViewed: [...appStore.userState.modalsViewed, Modal.SgtBanner]
    })
  }
})

function nextStep() {
  step.value++
  el.value && el.value.scrollTo({ top: 0 })
}
</script>

<template>
  <AppModal
    :is-open="modalStore.modals[Modal.SgtBanner]"
    class="max-w-4xl w-full"
    @modal:closed="onCloseModal"
  >
    <div class="max-h-[70vh] md:max-h-[60vh] grid grid-rows-[1fr_auto]">
      <div
        ref="el"
        class="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8 overflow-y-auto"
      >
        <div>
          <p class="text-2xl font-bold">{{ $t('sgt.bannerTitle') }}</p>
          <p class="my-4">
            {{ $t('sgt.spotGridTradingBot') }}

            <span class="font-bold">
              {{ $t('sgt.automatesBuyingAndSelling') }}
            </span>
          </p>

          <div class="space-y-6">
            <div class="flex">
              <div class="pr-2">
                <p class="text-blue-500 text-lg font-bold">1.</p>
              </div>

              <div class="space-y-4">
                <p class="text-blue-500 text-lg font-bold">
                  {{ $t('sgt.setUpABot') }}
                </p>

                <BaseAccordion v-model="step" v-bind="{ value: 1 }">
                  <template #content>
                    <div class="space-y-4">
                      <p>
                        <span class="font-bold">
                          {{ $t('sgt.priceRange') }}
                        </span>
                        {{ $t('sgt.step1text1') }}
                      </p>

                      <p>
                        <span class="font-bold">
                          {{ $t('sgt.numberOfGrids') }}
                        </span>
                        {{ $t('sgt.step1text2') }}
                      </p>

                      <p>
                        <span class="font-bold">{{
                          $t('sgt.investment')
                        }}</span>
                        {{ $t('sgt.step1text3') }}
                      </p>
                    </div>
                  </template>
                </BaseAccordion>
              </div>
            </div>

            <div class="flex">
              <div class="pr-2">
                <p class="text-blue-500 text-lg font-bold">2.</p>
              </div>

              <div class="space-y-4">
                <p class="text-blue-500 text-lg font-bold">
                  {{ $t('sgt.runABot') }}
                </p>

                <BaseAccordion v-model="step" v-bind="{ value: 2 }">
                  <template #content>
                    <div class="space-y-4">
                      <p>
                        {{ $t('sgt.step2text1') }}
                      </p>

                      <p>
                        {{ $t('sgt.step2text2') }}
                      </p>

                      <p>
                        <span class="font-bold">
                          {{ $t('sgt.viewOrders') }}
                        </span>
                        {{ $t('sgt.step2text3') }}
                      </p>

                      <p>
                        <i18n-t keypath="sgt.step2text4">
                          <template #faq>
                            <NuxtLink to="/" class="font-bold">FAQ</NuxtLink>
                          </template>
                        </i18n-t>
                      </p>
                    </div>
                  </template>
                </BaseAccordion>
              </div>
            </div>

            <div class="flex">
              <div class="pr-2">
                <p class="text-blue-500 text-lg font-bold">3.</p>
              </div>

              <div class="space-y-4">
                <p class="text-blue-500 text-lg font-bold">
                  {{ $t('sgt.endABot') }}
                </p>

                <BaseAccordion v-model="step" v-bind="{ value: 3 }">
                  <template #content>
                    <div class="space-y-4">
                      <p>{{ $t('sgt.step3text1') }}</p>

                      <p>
                        {{ $t('sgt.step3text2') }}
                      </p>

                      <p>
                        {{ $t('sgt.step3text3') }}
                      </p>
                    </div>
                  </template>
                </BaseAccordion>
              </div>
            </div>
          </div>
        </div>

        <div>
          <img
            src="/images/sgt-step1.webp"
            alt="step-1"
            class="max-lg:max-h-[300px] mx-auto lg:w-full object-contain"
            :class="[step === 1 ? 'block' : 'hidden']"
          />
          <img
            src="/images/sgt-step2.webp"
            alt="step-2"
            class="max-lg:max-h-[300px] mx-auto lg:w-full object-contain"
            :class="[step === 2 ? 'block' : 'hidden']"
          />
          <img
            src="/images/sgt-step3.webp"
            alt="step-3"
            class="max-lg:max-h-[300px] mx-auto lg:w-full object-contain"
            :class="[step === 3 ? 'block' : 'hidden']"
          />
        </div>
      </div>

      <div>
        <div class="flex justify-center space-x-2 mt-2 lg:mt-10">
          <div
            class="w-2 h-2 rounded-full"
            :class="[step >= 1 ? 'bg-blue-500' : 'bg-gray-400']"
          />
          <div
            class="w-2 h-2 rounded-full"
            :class="[step >= 2 ? 'bg-blue-500' : 'bg-gray-400']"
          />
          <div
            class="w-2 h-2 rounded-full"
            :class="[step >= 3 ? 'bg-blue-500' : 'bg-gray-400']"
          />
        </div>

        <div
          class="max-w-lg mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
        >
          <AppButton
            lg
            class="w-full font-sembold shadow-none select-none text-blue-500 border-blue-500"
            @click="onCloseModal"
          >
            {{ $t('sgt.skip') }}
          </AppButton>

          <AppButton
            v-if="step < 3"
            lg
            class="w-full font-sembold shadow-none select-none bg-blue-500 text-white"
            @click="nextStep"
          >
            {{ $t('sgt.next') }} ({{ step }}/3)
          </AppButton>

          <AppButton
            v-else
            lg
            class="w-full font-sembold shadow-none select-none bg-blue-500 text-white"
            @click="onCloseModal"
          >
            {{ $t('sgt.close') }}
          </AppButton>
        </div>
      </div>
    </div>
  </AppModal>
</template>

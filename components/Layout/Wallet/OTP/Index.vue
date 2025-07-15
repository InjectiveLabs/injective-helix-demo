<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const digits = ref(Array(6).fill(''))
const inputs = ref<HTMLInputElement[]>([])
const status = reactive(new Status(StatusType.Idle))

const isDisabled = computed(() => digits.value.join('').length !== 6)

function onBackspace(index: number) {
  inputs.value[index]?.focus()
}

function onPaste(value: string) {
  value.split('').forEach((digit, index) => {
    if (index < 6) {
      digits.value[index] = digit
    }
  })

  inputs.value[5].focus()
}

function onChange(index: number) {
  if (index === 6) {
    return
  }

  inputs.value[index].focus()
}

function onFillNext({ value, index }: { value: string; index: number }) {
  digits.value[index] = value

  inputs.value[index].focus()
}

function submit() {
  status.setLoading()

  sharedWalletStore
    .submitTurnkeyOTP(digits.value.join(''))
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div class="px-4 py-2 flex items-center flex-col">
    <h3>{{ $t('common.connect') }}</h3>

    <img src="/svg/otp.svg" class="py-8" />

    <p class="font-medium">{{ $t('connect.otpDescription') }}</p>

    <div class="mt-6 mb-8">
      <div class="flex gap-2 justify-center">
        <LayoutWalletOTPInput
          v-for="(_, index) in digits"
          :key="`otp-input-${index}`"
          ref="inputs"
          v-model="digits[index]"
          :index="index"
          @on:paste="onPaste"
          @on:change="onChange"
          @on:fill-next="onFillNext"
          @on:backspace="onBackspace"
        />
      </div>
    </div>

    <div class="w-[280px]">
      <AppButton
        size="lg"
        class="w-full"
        v-bind="{
          status,
          disabled: isDisabled
        }"
        @click="submit"
      >
        {{ $t('common.confirm') }}
      </AppButton>
    </div>
  </div>
</template>

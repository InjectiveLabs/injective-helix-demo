<script setup lang="ts">
import { useIMask } from 'vue-imask'
import { FactoryOpts } from 'imask'
import { DerivativesTradeFormField } from '@/types'

const { value: leverage } = useStringField({
  name: DerivativesTradeFormField.Leverage,
  initialValue: '1'
})

const { el, typed } = useIMask(
  computed(
    () =>
      ({
        mask: 'num',
        lazy: false,
        blocks: {
          num: {
            mask: Number,
            thousandsSeparator: ',',
            radix: '.',
            mapToRadix: ['.', ','],
            scale: 2,
            lazy: false,
            min: 0,
            max: 10,
            autofix: true
          }
        }
      }) as FactoryOpts
  )
)

const leverageModel = computed({
  get: () => leverage.value || '0',
  set: (value) => {
    leverage.value = value
    typed.value = value
  }
})

watch(
  () => typed.value,
  (value) => {
    leverage.value = value
  }
)

function onBlur() {
  typed.value = leverage.value || '0'
}

function onEnter(ev: Event) {
  const target = ev.target as HTMLInputElement
  target.blur()
}
</script>

<template>
  <p class="field-label mb-2">{{ $t('trade.leverage') }}</p>
  <div class="flex items-center">
    <div class="flex-1 pr-4 relative">
      <div
        class="absolute top-2 bottom-3 right-4 inset-x-0 bg-brand-800 rounded-md"
      />

      <input
        v-model="leverageModel"
        min="0"
        :max="10"
        step="0.01"
        type="range"
        class="range w-full"
      />
    </div>

    <label class="field-style flex px-3 basis-24 min-w-0 h-12">
      <input
        ref="el"
        :value="leverage"
        type="text"
        class="min-w-0 bg-transparent focus:outline-none font-mono text-sm text-right"
        @keydown.enter="onEnter"
        @blur="onBlur"
      />
      <span class="flex items-center pl-2 select-none">&times;</span>
    </label>
  </div>
</template>

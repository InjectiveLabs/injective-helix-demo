<script lang="ts" setup>
import enFile from '@/i18n/locales/en'
import cnFile from '@/i18n/locales/cn'
import krFile from '@/i18n/locales/kr'
import trFile from '@/i18n/locales/tr'

definePageMeta({
  middleware: [
    (to) => {
      if (to.path.includes('/locales') && to.query.devMode !== 'true') {
        return navigateTo('/')
      }
    }
  ]
})

const { locales } = useI18n()
const { copy } = useClipboard()

const messages = {
  en: enFile('en'),
  zh: cnFile('zh'),
  kr: krFile('kr'),
  tr: trFile('tr')
}

const hasCopied = ref(false)
const selectedCode = ref(locales.value[0].code)
const differences = ref<Record<string, any>>({})

onMounted(() => {
  findMissingLocales(locales.value[1].code)
})

function copyContent() {
  copy(JSON.stringify(differences.value, null, 2))

  hasCopied.value = true

  setTimeout(() => {
    hasCopied.value = false
  }, 3000)
}

function findMissingLocales(lang: keyof typeof messages) {
  selectedCode.value = lang

  if (lang === 'en') {
    differences.value = messages['en']
  } else {
    differences.value = compareLocales(messages['en'], messages[lang])
  }
}

function deepClone(obj: Record<string, any>) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const clone: any = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    clone[key] = deepClone(obj[key])
  }

  return clone
}

function compareLocales(
  source: Record<string, any>,
  target: Record<string, any>
): Record<string, any> {
  const missing: Record<string, any> = {}

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = target?.[key]

    const isObject =
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof sourceValue === 'object'

    if (target && !(key in target)) {
      missing[key] = isObject ? deepClone(sourceValue) : sourceValue
    } else if (isObject) {
      const nestedMissing = compareLocales(sourceValue, targetValue)

      if (Object.keys(nestedMissing).length > 0) {
        missing[key] = nestedMissing
      }
    }
  }

  return missing
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-12 py-12">
    <article class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button
          v-for="(item, index) in locales"
          :key="index"
          type="button"
          :class="[
            { 'mr-5': item.code === 'en' },
            item.code === selectedCode ? 'bg-blue-500' : 'bg-gray-700',
            'flex items-center rounded-lg font-semibold outline-none justify-center py-2 px-4 text-sm h-[30px] max-h-[30px] hover:bg-opacity-80'
          ]"
          @click="findMissingLocales(item.code)"
        >
          <div class="flex items-center gap-1">
            <span>{{ item.longName }}</span>
          </div>
        </button>
      </div>

      <button
        v-if="Object.keys(differences).length > 0"
        type="button"
        class="flex items-center rounded-lg font-semibold outline-none justify-center py-2 px-4 text-sm h-[30px] max-h-[30px] bg-blue-500 hover:bg-opacity-80"
        @click="copyContent"
      >
        <div class="flex items-center gap-1">
          <span>{{ hasCopied ? 'Copied!' : 'Copy' }}</span>
        </div>
      </button>
    </article>

    <div class="flex items-start gap-2 text-xs mt-4">
      <pre class="text-wrap">{{ differences }}</pre>
    </div>
  </div>
</template>

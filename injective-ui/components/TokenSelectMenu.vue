<script setup lang="ts">
import { TokenStatic } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    tokens: TokenStatic[]
    modelValue?: string
    showDenom?: boolean
  }>(),
  { showDenom: false, modelValue: undefined }
)

const formattedTokens = computed(() =>
  props.tokens.map((token) => ({
    label: `${token.symbol} (${token.name})`,
    avatar: {
      src: token.logo
    },
    denom: token.denom,
    symbol: token.symbol,
    name: token.name
  }))
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedToken = computed(() =>
  formattedTokens.value.find((a) => a.denom === props.modelValue)
)

const value = computed({
  get: () => formattedTokens.value.find((a) => a.denom === props.modelValue),
  set: (value: TokenStatic) => {
    emit('update:modelValue', value.denom)
  }
})
</script>

<template>
  <USelectMenu
    v-model="value"
    by="denom"
    size="lg"
    searchable
    :search-attributes="['name', 'symbol', 'denom']"
    clear-search-on-close
    :options="formattedTokens"
    :placeholder="$t('common.selectToken')"
  >
    <template v-if="selectedToken?.avatar.src" #leading>
      <UAvatar :src="selectedToken?.avatar.src" size="2xs" />
    </template>

    <template v-if="showDenom" #option="{ option: token }">
      <div class="pr-4 flex space-x-2 items-center truncate">
        <UAvatar
          v-if="token.avatar.src"
          :src="token.avatar.src"
          size="xs"
          :alt="token.label"
        />

        <div class="truncate flex-1">
          <p>{{ token.label }}</p>
          <p class="text-gray-500 truncate">{{ token.denom }}</p>
        </div>
      </div>
    </template>
  </USelectMenu>
</template>

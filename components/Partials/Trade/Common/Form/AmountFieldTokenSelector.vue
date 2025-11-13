<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { MarketCyTags, TradeAmountOption } from '@/types'

const props = withDefaults(
  defineProps<{
    options: Array<{ id: TradeAmountOption; label: string }>
  }>(),
  {
    options: () => []
  }
)

const selectedValue = defineModel<string>({ required: true })

const selectedSymbol = computed(
  () =>
    props.options.find(
      (item) => item.id === (selectedValue.value as TradeAmountOption)
    )?.label || ''
)
</script>

<template>
  <USelectMenu
    v-model="selectedValue"
    v-bind="{
      options,
      variant: 'none',
      valueAttribute: 'id',
      uiMenu: { width: 'w-auto' },
      popper: { offsetDistance: 12 }
    }"
  >
    <div
      class="flex items-center gap-2"
      :data-cy="dataCyTag(MarketCyTags.AmountFieldTokenSelectorDropdown)"
    >
      <span>
        {{ selectedSymbol }}
      </span>

      <UIcon
        :name="NuxtUiIcons.ChevronDown"
        class="size-3 transition-all text-gray-500 -mb-0.5"
      />
    </div>

    <template #option="{ option }">
      <span
        class="mr-1"
        :data-cy="
          option.id === TradeAmountOption.Base
            ? dataCyTag(MarketCyTags.TokenSelectorOptionsBaseToken)
            : dataCyTag(MarketCyTags.TokenSelectorOptionsQuoteToken)
        "
      >
        {{ option.label }}
      </span>
    </template>
  </USelectMenu>
</template>

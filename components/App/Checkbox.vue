<script lang="ts" setup>
const props = defineProps({
  disabled: Boolean,
  modelValue: Boolean,

  dataCy: {
    type: String,
    default: 'unknown-id'
  },

  tooltip: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', state: boolean): void
}>()

const uid = computed(() => {
  return window.crypto.getRandomValues(new Uint32Array(1))[0].toString()
})

const checked = computed({
  get: (): boolean => {
    return props.modelValue
  },

  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <div class="flex items-center justify-start">
    <div class="checkbox-wrapper mr-2">
      <input
        :id="uid"
        v-model="checked"
        :disabled="disabled"
        class="checkbox"
        type="checkbox"
      />
      <label
        :for="uid"
        :data-cy="dataCy"
        class="top-0 left-0 flex items-center justify-center absolute"
        :class="{ 'cursor-pointer': !disabled }"
      >
        <BaseIcon name="check" class="w-2 h-2 text-gray-750 checkmark" />
        <BaseIcon name="minus" class="w-2 h-2 text-gray-500 minus" />
      </label>
    </div>
    <label
      :for="uid"
      class="select-none text-xs"
      :class="{
        'text-gray-500': disabled,
        'text-white cursor-pointer': !disabled
      }"
    >
      <slot />
    </label>
  </div>
</template>

<style scoped>
.checkbox-wrapper {
  --checkbox-width: 16px;
  --checkbox-height: 16px;
  position: relative;
  width: var(--checkbox-width);
  height: var(--checkbox-height);
}

.checkbox-wrapper input[type='checkbox'] {
  visibility: hidden;
  width: var(--checkbox-width);
  height: var(--checkbox-height);
}

.checkbox-wrapper input[type='checkbox'] + label {
  width: var(--checkbox-width);
  height: var(--checkbox-height);
  border: 1px solid white;
  background-color: transparent;
}

.checkbox-wrapper input[type='checkbox'] + label .checkmark,
.checkbox-wrapper input[type='checkbox'] + label .minus {
  display: none;
}

.checkbox-wrapper input[type='checkbox']:checked + label {
  background-color: #fff;
}

.checkbox-wrapper input[type='checkbox']:checked + label .checkmark {
  display: block;
}

.checkbox-wrapper input[type='checkbox']:disabled + label {
  border-color: #727376;
  background-color: transparent;
}

.checkbox-wrapper input[type='checkbox']:disabled + label .checkmark {
  display: none;
}

.checkbox-wrapper input[type='checkbox']:disabled + label .minus {
  display: block;
}
</style>

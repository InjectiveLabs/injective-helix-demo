<script lang="ts" setup>
const emit = defineEmits<{
  'limit:increment': []
}>()

function incrementLimit() {
  emit('limit:increment')
}
</script>

<template>
  <AppButton
    v-bind="{
      size: 'xs',
      variant: 'primary-outline'
    }"
    class="cursor-pointer text-center border-gray-450 rounded-[4px] mx-auto -mt-4 relative"
    @click="incrementLimit"
  >
    <div class="font-normal text-sm leading-4 px-4">
      {{ $t('leaderboard.viewMore') }}
    </div>
  </AppButton>
</template>

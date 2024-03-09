<script setup lang="ts">
const props = defineProps({
  value: {
    type: Number,
    default: 0
  },

  size: {
    type: Number,
    default: 16
  }
})

function getStringFromNumber(number: number) {
  const numberFormatted = new Intl.NumberFormat('en-us', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number)

  const [roundedNumber, fractionNumbers] = numberFormatted.split('.')

  const reversedRoundedNumber = roundedNumber.split('').reverse()

  const newArray = []

  for (let i = 0; i < reversedRoundedNumber.length; i++) {
    if (i % 3 === 0 && i !== 0) {
      newArray.push(',')
    }

    newArray.push(0)
  }

  return newArray.reverse().join('') + '.' + fractionNumbers
}

const number = ref(0)
const isInitialized = ref(false)

const characters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ',']
const paddingH = 10

const numberFormatted = computed(() =>
  new Intl.NumberFormat('en-us', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number.value)
)

const numberSplitted = computed(() =>
  !isInitialized.value
    ? getStringFromNumber(props.value)
    : numberFormatted.value.split('')
)

onMounted(() => {
  setTimeout(() => {
    isInitialized.value = true
    number.value = props.value
  }, 50)
})

watch(
  () => props.value,
  (newVal) => {
    number.value = newVal
  }
)
</script>

<template>
  <div>
    <div class="flex">
      <div
        v-for="(char, index) in numberSplitted"
        :key="index"
        class="text-2xl font-bold overflow-hidden"
        :style="{
          height: `${size + paddingH}px`
        }"
      >
        <div
          v-for="(character, i) in characters"
          :key="`${i}`"
          :style="{
            transform: `translateY(${
              -(size + paddingH) * characters.findIndex((el) => char === el)
            }px)`,
            lineHeight: `${size + paddingH}px`,
            height: `${size + paddingH}px`,
            width: `${[',', '.'].includes(char) ? size / 1.5 : size}px`
          }"
          class="transition-all duration-1000 ease-in-out font-sans"
        >
          {{ character }}
        </div>
      </div>
    </div>
  </div>
</template>

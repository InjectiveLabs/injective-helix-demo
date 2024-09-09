<script setup lang="ts">
const props = withDefaults(
  defineProps<{ value?: number; size?: number; decimals?: number }>(),
  {
    value: 0,
    size: 16,
    decimals: 2
  }
)

function getStringFromNumber(number: number) {
  const numberFormatted = number.toFixed(props.decimals)
  const [roundedNumber, fractionNumbers] = numberFormatted.split('.')
  const reversedRoundedNumber = roundedNumber.split('').reverse()

  const newArray = []

  for (let i = 0; i < reversedRoundedNumber.length; i++) {
    if (i % 3 === 0 && i !== 0) {
      newArray.push(',')
    }

    newArray.push(0)
  }

  const result =
    newArray.reverse().join('') + '.' + '0'.repeat(fractionNumbers.length)

  return result
}

const number = ref(0)
const isInitialized = ref(false)

const characters = [
  '-',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '.',
  ','
]
const paddingH = 10

const numberFormatted = computed(() =>
  new Intl.NumberFormat('en-us', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals
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
    <div class="flex items-center">
      <div
        v-for="(char, index) in numberSplitted"
        :key="index"
        class="text-2xl font-bold overflow-hidden"
        :style="{
          height: `${props.size + paddingH}px`
        }"
      >
        <div
          v-for="(character, i) in characters"
          :key="`${i}`"
          :style="{
            transform: `translateY(${
              -(props.size + paddingH) *
              characters.findIndex((el) => char === el)
            }px)`,
            lineHeight: `${props.size + paddingH}px`,
            height: `${props.size + paddingH}px`,
            width: `${
              [',', '.'].includes(char) ? props.size / 3 : props.size / 1.45
            }px`,
            fontSize: `${props.size}px`
          }"
          class="transition-all duration-[1s] font-sans text-center ease-in-out"
        >
          {{ character }}
        </div>
      </div>
    </div>
  </div>
</template>

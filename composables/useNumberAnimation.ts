import gsap from 'gsap'

export default function useNumberAnimation(number: MaybeRef<number>) {
  const data = reactive({ value: 0 })

  watch(
    () => number,
    (newValue) => {
      gsap.to(data, {
        value: newValue,
        duration: 1,
        ease: 'power1.inOut'
      })
    },
    { immediate: true }
  )

  const zeros = computed(() => {
    const originalZeros = number.toString().split('.')[0].length
    const newZeros = data.value.toString().split('.')[0].length

    return originalZeros - newZeros
  })

  return { value: toRef(data, 'value'), zeros }
}

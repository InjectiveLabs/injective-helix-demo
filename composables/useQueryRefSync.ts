export default function useQueryRefSync(name: string, defaultValue: string) {
  const route = useRoute()
  const router = useRouter()

  const valueRef = ref(defaultValue)

  const value = computed({
    get: () => (route.query[name] as string) || defaultValue,
    set: (value) => {
      valueRef.value = value
    }
  })

  watch(
    value,
    (value) => {
      router.push({
        name: route.name!,
        params: route.params,
        query: {
          ...route.query,
          [name]: value === defaultValue ? undefined : (value as string)
        }
      })
    },
    { flush: 'sync' }
  )

  return value
}

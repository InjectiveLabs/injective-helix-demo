export default function useQueryRef<T>(name: string, defaultValue: T) {
  const route = useRoute()
  const router = useRouter()

  const value = computed({
    get: () => (route.query[name] as T) || defaultValue,
    set: (value) => {
      router.push({
        name: route.name!,
        params: route.params,
        query: {
          ...route.query,
          [name]: value === defaultValue ? undefined : (value as string)
        }
      })
    }
  })

  return value
}

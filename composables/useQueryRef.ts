export default function useQueryRef(name: string, defaultValue: string) {
  const route = useRoute()
  const router = useRouter()

  const value = computed({
    get: () => (route.query[name] as string) || defaultValue,
    set: (value) => {
      router.push({
        name: route.name!,
        params: route.params,
        query: {
          ...route.query,
          [name]: value
        }
      })
    }
  })

  return value
}

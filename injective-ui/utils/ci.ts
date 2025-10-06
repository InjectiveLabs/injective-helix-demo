import { useRoute } from 'vue-router'

export const dataCyTag = (tag: string): string => {
  const route = useRoute()

  const routeName = route.name as string

  return `${routeName}-${tag}`
}

export const commonCyTag = (tag: string): string => {
  return `common-${tag}`
}

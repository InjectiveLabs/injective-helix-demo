import { Ref } from 'vue'
import {
  UI_DEFAULT_PAGINATION_LIMIT_COUNT,
  UI_MAX_PAGINATION_LIMIT_COUNT
} from '@/app/utils/constants'
import { PaginationState } from '@/types/enums'

export function usePagination({ totalCount }: { totalCount: Ref<number> }) {
  const route = useRoute()
  const router = useRouter()

  const limit = computed((): number => {
    return Number(route.query.limit) || UI_DEFAULT_PAGINATION_LIMIT_COUNT
  })

  const page = computed(() => {
    return Number(route.query.page) || 1
  })

  const totalPages = computed(() => {
    return Math.ceil(totalCount.value / limit.value)
  })

  const getPaginationState = (): PaginationState | undefined => {
    const { page, limit } = route.query

    const queryPage = Number(page || 1)
    const queryPageExist = queryPage > 1

    const queryPageMoreThanTotalPage =
      queryPage > totalPages.value && totalPages.value > 0
    const invalidQueryPage = queryPage < 0 || !Number.isInteger(queryPage)
    const invalidQueryLimit = Number(limit) > UI_MAX_PAGINATION_LIMIT_COUNT

    if (invalidQueryPage || invalidQueryLimit) {
      return PaginationState.InvalidQuery
    }

    if (queryPageMoreThanTotalPage) {
      return PaginationState.QueryMoreThanTotalPage
    }

    if (queryPageExist) {
      return PaginationState.QueryPageExist
    }
  }

  const updateRouteQuery = (query: Record<any, string | undefined>) => {
    router.push({
      name: route.name as string,
      params: route.params,
      query
    })
  }

  const skip = computed(() => (Number(page.value) - 1) * limit.value)

  return {
    getPaginationState,
    limit,
    page,
    skip,
    totalPages,
    updateRouteQuery
  }
}

import { Ref, MaybeRefOrGetter } from 'vue'

export default function useSort(
  rows: Ref<any[]>,
  columns: MaybeRefOrGetter<any[]>
) {
  const sortBy = ref(toValue(columns)[0].key)
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const sortedRows = computed(() => {
    return rows.value.sort((a, b) => {
      const columnSortingFunction = toValue(columns).find(
        (column) => column.key === sortBy.value
      )?.sort as (a: any, b: any, direction: string) => number

      const sortingFunction = columnSortingFunction || stringSort

      return sortingFunction(
        a[sortBy.value],
        b[sortBy.value],
        sortDirection.value
      )
    })
  })

  function stringSort(a: any, b: any, direction: string) {
    return direction === 'asc'
      ? String(a).localeCompare(String(b))
      : String(b).localeCompare(String(a))
  }

  return {
    sortBy,
    sortedRows,
    sortDirection,
    sortOptions: toValue(columns)
      .filter((column) => column.sortable)
      .map((column) => ({
        label: column.label,
        value: column.key
      }))
  }
}

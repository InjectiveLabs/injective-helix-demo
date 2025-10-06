import { useField } from 'vee-validate'
import { computed, type Ref } from 'vue'

export function useBooleanField({
  name,
  dynamicRule,
  initialValue,
  rule = 'required',
  label
}: {
  name: string
  rule?: string
  label?: string
  initialValue?: boolean
  dynamicRule?: Ref<string>
}) {
  const validation = computed(() =>
    [rule, dynamicRule?.value].filter((rule) => rule).join('|')
  )

  return useField<boolean>(name, validation, {
    initialValue: initialValue || false,
    label
  })
}

export function useNumberField({
  name,
  dynamicRule,
  initialValue,
  rule = 'required',
  label
}: {
  name: string
  rule?: string
  label?: string
  initialValue?: number
  dynamicRule?: Ref<string>
}) {
  const validation = computed(() =>
    [rule, dynamicRule?.value].filter((rule) => rule).join('|')
  )

  return useField<number>(
    name,
    validation,
    initialValue
      ? {
          initialValue,
          label
        }
      : {
          label
        }
  )
}

export function useStringField({
  name,
  dynamicRule,
  initialValue,
  rule = 'required',
  label
}: {
  name: string
  rule?: string
  label?: string
  initialValue?: string
  dynamicRule?: Ref<string>
}) {
  const validation = computed(() =>
    [rule, dynamicRule?.value].filter((rule) => rule).join('|')
  )

  return useField<string>(
    name,
    validation,
    typeof initialValue === 'string'
      ? {
          initialValue,
          label
        }
      : {
          label
        }
  )
}

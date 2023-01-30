import { ActivityField } from '@/types'

export type ActivityForm = Record<ActivityField, any>

export type ActivityFormValue = {
  field: ActivityField
  value: string
}

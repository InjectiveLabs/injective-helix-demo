import type { EventLog } from '@injectivelabs/sdk-ts'
import type { SharedEventAttribute } from './../types'

export const filterEventLogs = ({
  logs,
  filter
}: {
  filter: string
  logs: EventLog[]
}): EventLog | undefined =>
  logs.find((log) => log.events.find((event) => event.type === filter))

export const filterAttributeValue = ({
  filter,
  attributes
}: {
  filter: string
  attributes: SharedEventAttribute[]
}): undefined | SharedEventAttribute =>
  attributes.find(({ key }) => key === filter)

export const checkAttributeExist = ({
  key,
  value,
  attributes
}: {
  key: string
  value?: string
  attributes: SharedEventAttribute[]
}): boolean =>
  attributes.some(
    (attribute) =>
      (attribute.key === key && !value) || attribute.value === value
  )

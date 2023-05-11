import { vi } from 'vitest'
import { createTestingPinia, TestingPinia } from '@pinia/testing'

type Config = Record<string, Record<string, any>>

export const mockPinia = ({
  mock = {},
  initialState = {}
}: {
  mock: Config
  initialState: Config
}): TestingPinia => {
  return createTestingPinia({
    stubActions: false,
    initialState,
    plugins: [
      ({ store }) => {
        if (mock[store.$id]) {
          Object.entries(store).forEach(([key, value]) => {
            if (mock[store.$id][key]) {
              store[key] = mock[store.$id][key]
            } else if (typeof value === 'function') {
              store[key] = vi.fn()
            }
          })
        }
      }
    ]
  })
}

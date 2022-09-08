import { init } from '@amplitude/analytics-browser'
import { Context } from '@nuxt/types'
import { AMPLITUDE_KEY, HAS_AMPLITUDE_KEY } from '~/app/utils/constants'

export default function (_ctx: Context) {
  if (HAS_AMPLITUDE_KEY) {
    init(AMPLITUDE_KEY)
  }
}

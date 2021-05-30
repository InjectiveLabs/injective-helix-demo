import { HttpClient } from '@injectivelabs/utils'
import { IS_PRODUCTION } from '../utils/constants'

export class MetricsProvider {
  private httpClient: HttpClient
  public env: string
  public locale: string

  constructor({
    baseUrl,
    locale,
    env
  }: {
    baseUrl: string
    locale: string
    env: string
  }) {
    this.httpClient = new HttpClient(baseUrl)
    this.env = env
    this.locale = locale
  }

  async wrap<T>(
    promise: Promise<any>
  ): Promise<{ response: T; duration: number }> {
    const start = performance.now()

    const response = (await promise) as T

    const end = performance.now()

    return { response, duration: parseInt((end - start).toString()) }
  }

  record(bucket: string, duration: number) {
    if (IS_PRODUCTION && this.recordMetrics()) {
      this.timing(bucket, duration)
      this.incr(bucket)
    }
  }

  recordWithoutProbability(bucket: string, duration: number) {
    if (IS_PRODUCTION) {
      this.timing(bucket, duration)
      this.incr(bucket)
    }
  }

  recordError(bucket: string) {
    if (IS_PRODUCTION && this.recordMetrics()) {
      this.incr(bucket + 'Errors')
    }
  }

  private async timing(bucket: string, duration: number) {
    return await this.httpClient.post(`timing/${bucket}.timing`, {
      dur: duration,
      tags: 'locale=' + this.locale + ',env=' + this.env
    })
  }

  private async incr(bucket: string) {
    return await this.httpClient.post(`incr/${bucket}.counter`, {
      tags: 'locale=' + this.locale + ',env=' + this.env
    })
  }

  async pageLoadTiming(page: string, duration: number) {
    return await this.httpClient.post('timing/pageloads.timing', {
      dur: duration,
      tags: 'locale=' + this.locale + ',env=' + this.env + ',page=' + page
    })
  }

  private recordMetrics(): boolean {
    return Math.random() < 0.1
  }
}

export const metricsProvider = new MetricsProvider({
  locale: 'en',
  baseUrl: 'https://telegraf.injective.dev/statsd',
  env: process.env.APP_ENV || 'local'
})

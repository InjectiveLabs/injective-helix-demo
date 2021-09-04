import { HttpClient } from '@injectivelabs/utils'
import { app } from '../singletons/App'
import { IS_PRODUCTION, METRICS_ENABLED } from '../utils/constants'

export class MetricsProvider {
  private httpClient: HttpClient
  public env: string

  constructor({ baseUrl, env }: { baseUrl: string; env: string }) {
    this.httpClient = new HttpClient(baseUrl)
    this.env = env
  }

  async wrap<T>(
    promise: Promise<any>
  ): Promise<{ response: T; duration: number }> {
    const start = performance.now()

    const response = (await promise) as T

    const end = performance.now()

    return { response, duration: parseInt((end - start).toString()) }
  }

  async sendAndRecord<T>(promise: Promise<T>, bucket: string): Promise<T> {
    try {
      const start = performance.now()
      const response = (await promise) as T
      const end = performance.now()
      const duration = parseInt((end - start).toString())

      this.record(bucket, duration)
      return response
    } catch (error: any) {
      this.recordError(bucket)
      throw error
    }
  }

  record(bucket: string, duration: number) {
    if (this.recordMetrics()) {
      this.timing(bucket, duration)
      this.incr(bucket)
    }
  }

  recordError(bucket: string) {
    this.incr(bucket + 'Errors')
  }

  private async timing(bucket: string, duration: number) {
    return await this.httpClient.post(`timing/${bucket}.timing`, {
      dur: duration,
      tags: 'region=' + app.regionForMetrics + ',env=' + this.env
    })
  }

  private async incr(bucket: string) {
    return await this.httpClient.post(`incr/${bucket}.counter`, {
      tags: 'region=' + app.regionForMetrics + ',env=' + this.env
    })
  }

  async pageLoadTiming(page: string, duration: number) {
    return await this.httpClient.post('timing/pageloads.timing', {
      dur: duration,
      tags:
        'region=' + app.regionForMetrics + ',env=' + this.env + ',page=' + page
    })
  }

  private recordMetrics(): boolean {
    return IS_PRODUCTION && METRICS_ENABLED
  }
}

export const metricsProvider = new MetricsProvider({
  baseUrl: 'https://telegraf.injective.dev/statsd',
  env: process.env.APP_ENV || 'local'
})

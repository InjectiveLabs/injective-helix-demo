import axios from 'axios'
import type { AxiosInstance } from 'axios'

export class UiApiService {
  client: AxiosInstance

  constructor(url: string) {
    this.client = axios.create({ baseURL: url, timeout: 15000 })
  }
}

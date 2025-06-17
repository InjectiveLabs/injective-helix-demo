import { HttpClient } from '@injectivelabs/utils'
import { SHEETDB_BEARER_TOKEN } from '@/app/utils/constants'

export const submitInstitutionalForm = async (formData: {
  email: string
  lastName: string
  business: string
  telegram: string
  firstName: string
}) => {
  const SHEETDB_ID = 'n12i35jk7t15h'
  const httpClient = new HttpClient('https://sheetdb.io/api/v1/')

  httpClient.setConfig({
    headers: { Authorization: `Bearer ${SHEETDB_BEARER_TOKEN}` }
  })

  const { data } = (await httpClient.post(SHEETDB_ID, formData)) as {
    data: { created: number }
  }

  return data
}

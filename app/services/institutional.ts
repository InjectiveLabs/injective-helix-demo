import { HttpClient } from '@injectivelabs/utils'
import { SHEETDB_BEARER_TOKEN } from '@/app/utils/constants'

const SHEETDB_ID = 'fwfkb2v469gav'

const httpClient = new HttpClient('https://sheetdb.io/api/v1/')

httpClient.setConfig({
  headers: { Authorization: `Bearer ${SHEETDB_BEARER_TOKEN}` }
})

export const submitInstitutionalForm = async (formData: {
  firstName: string
  lastName: string
  email: string
  business: string
  telegram: string
}) => {
  const { data } = (await httpClient.post(SHEETDB_ID, formData)) as {
    data: { created: number }
  }

  return data
}

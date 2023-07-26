import { HttpClient } from '@injectivelabs/utils'
import { VITE_SHEETDB_BEARER_TOKEN } from '../utils/constants'

const sheetDbID = 'fwfkb2v469gav'

const httpClient = new HttpClient('https://sheetdb.io/api/v1/')

httpClient.setConfig({
  headers: { Authorization: `Bearer ${VITE_SHEETDB_BEARER_TOKEN}` }
})

export const submitInstitutionalForm = async (formData: {
  firstName: string
  lastName: string
  email: string
  business: string
  telegram: string
}) => {
  const { data } = (await httpClient.post(sheetDbID, formData)) as {
    data: { created: number }
  }

  return data
}

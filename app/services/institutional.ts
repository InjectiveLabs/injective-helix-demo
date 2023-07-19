import { HttpClient } from '@injectivelabs/utils'

const httpClient = new HttpClient('https://sheetdb.io/api/v1/')

const sheetDbID = 'l0rx2xiryfrh3'

export const submitInstitutionalForm = async (formData: {
  firstName: string
  lastName: string
  email: string
  company: string
  telegram: string
}) => {
  const { data } = (await httpClient.post(sheetDbID, formData)) as {
    data: { created: number }
  }

  return data
}

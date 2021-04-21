import { sleep } from './sleep'

export const promisify = (fn: Function): Promise<any> =>
  new Promise((resolve, reject) =>
    fn((err: any, res: any) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  )

export const backupPromiseCall = async <T>(promise: () => Promise<T>) => {
  await promise()
  await sleep(1000)

  sleep(3000).then(async () => {
    await promise()
  })
}

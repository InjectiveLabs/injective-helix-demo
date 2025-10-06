type ApiConstructor<T> = new (endpoint: string) => T

const sdkTsApiCache = new Map<string, any>()

export const lazyImportSdkTs = async <T>({
  endpoint,
  className
}: {
  endpoint: string
  className: string
}): Promise<T> => {
  const cacheKey = `${className}-${endpoint}`

  if (sdkTsApiCache.has(cacheKey)) {
    return sdkTsApiCache.get(cacheKey) as T
  }

  // todo: experiment with adding [class] here
  const module = await import('@injectivelabs/sdk-ts')

  const ApiClass = (module as any)[className] as ApiConstructor<T>

  if (typeof ApiClass !== 'function') {
    throw new Error(
      `"${className}" is not a valid constructor in sdk-ts module`
    )
  }

  const instance = new ApiClass(endpoint)

  sdkTsApiCache.set(cacheKey, instance)

  return instance
}

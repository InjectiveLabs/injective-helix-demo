import fs from 'fs'
import { resolve } from 'path'

// https://github.com/nuxt/framework/discussions/5379#discussioncomment-2942984
const NuxtTsConfig = fs.readFileSync('./.nuxt/tsconfig.json').toString()
const tsConfigFormated = JSON.parse(
  NuxtTsConfig.replace(
    /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
    (value, invalidValue) => {
      return invalidValue ? '' : value
    }
  )
)

const configPaths = (path: string) => resolve(__dirname, `../../${path}`)
export const generatedAlias: Record<string, string> = {}

Object.entries(tsConfigFormated.compilerOptions.paths).forEach(
  ([key, value]: [string, any]) => {
    generatedAlias[key] = configPaths(value[0])
  }
)

export const alias = {
  ...generatedAlias
}

export const injectiveUIResolver = (componentName: string) => {
  if (componentName.startsWith('Base')) {
    const name = componentName.replace('Base', '')

    return {
      name: 'default',
      from: `~/node_modules/@injectivelabs/shared-ui/lib/components/${name}.vue`
    }
  }
}

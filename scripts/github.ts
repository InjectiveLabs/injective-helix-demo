/* eslint-disable no-console */
import 'dotenv/config'
import { simpleGit } from 'simple-git'
import { storeJsonFile } from './helper'

const main = async () => {
  try {
    const git = simpleGit(process.cwd())

    const { latest } = await git.tags()
    const tag = process.env.GIT_TAG || latest || 'dev'
    const { all } = latest
      ? await git.log({ from: latest, to: 'HEAD' })
      : await git.log(['-n', '20'])
    const branch = await git.revparse(['--abbrev-ref', 'HEAD'])

    const repositoryUrl = 'https://github.com/InjectiveLabs/injective-helix-demo'
    const gitTagLink = `${repositoryUrl}/releases/tag/${tag}`

    if (process.env.GIT_TAG) {
      storeJsonFile('app/json/gitVersion.json', {
        branch,
        gitTagLink,
        tag,
        logs: []
      })

      return
    }

    const logs = all.map((log: any) => ({
      ...log,
      commitLink: `${repositoryUrl}/commit/${log.hash}`
    }))

    storeJsonFile('app/json/gitVersion.json', {
      branch,
      tag,
      gitTagLink,
      logs
    })

    console.log('✅✅✅ Github version')
  } catch (err) {
    console.error('❌❌❌ Github version')
    throw err
  }
}

main()

/* eslint-disable no-console */
import 'dotenv/config'
import { simpleGit } from 'simple-git'
import { storeJsonFile } from './helper'

const main = async () => {
  try {
    const git = simpleGit(process.cwd())

    const { latest } = await git.tags()
    const { all } = await git.log({ from: latest, to: 'HEAD' })
    const branch = await git.revparse(['--abbrev-ref', 'HEAD'])

    const gitTagLink = `https://github.com/InjectiveLabs/injective-helix/releases/tag/${
      process.env.GIT_TAG || latest
    }`

    if (process.env.GIT_TAG) {
      storeJsonFile('app/json/gitVersion.json', {
        branch,
        gitTagLink,
        tag: process.env.GIT_TAG,
        logs: []
      })

      return
    }

    const logs = all.map((log: any) => ({
      ...log,
      commitLink: `https://github.com/InjectiveLabs/injective-helix/commit/${log.hash}`
    }))

    storeJsonFile('app/json/gitVersion.json', {
      branch,
      tag: latest,
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

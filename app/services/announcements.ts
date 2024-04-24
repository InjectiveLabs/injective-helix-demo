import { HttpClient } from '@injectivelabs/utils'

const httpClient = new HttpClient('https://helix-blog.ghost.io/ghost/api')

export const fetchAnnouncementsList = async () => {
  try {
    const HELIX_BLOG_SUFFIX =
      '/content/posts/?include=tags&filter=tags%3Ahash-homepage&order=published_at%20desc&key=fe734918d0197c95302f62ee55'

    const { data } = (await httpClient.get(HELIX_BLOG_SUFFIX)) as {
      data: any
    }

    return data
  } catch (e: unknown) {
    // silently throw error
  }
}

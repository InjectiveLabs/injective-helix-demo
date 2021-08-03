import { BASE_URL } from './constants'

export const mapKeys = <T, V, U>(
  m: Map<T, V>,
  fn: (this: void, v: V) => U
): Map<T, U> => {
  function transformPair([k, v]: [T, V]): [T, U] {
    return [k, fn(v)]
  }

  return new Map(Array.from(m.entries(), transformPair))
}

export const uniqueId = (characters: number = 6): string =>
  (
    Number(String(Math.random()).slice(2)) +
    Date.now() +
    Math.round(performance.now())
  ).toString(characters)

export const headTitle =
  'Injective Exchange - DeFi DEX | Decentralized Derivatives Trading. Any Market. Anytime. Anywhere.'

export const metaTags = (): {
  appMetaTags: () => Object[]
  pwaMetaTags: () => Object
  manifestMetaTags: () => Object
} => {
  const title =
    'Injective Protocol - Decentralized Derivatives Trading. Any Market. Anytime. Anywhere.'
  const description =
    'Injective is the first front-running resistant, layer-2 exchange protocol that unlocks the full potential of borderless finance by supporting margin trading, derivatives, and futures.'
  const keywords =
    'injective protocol, dapp, decentralized app, cryptocurrency, criptocurrency exchange, exchange, exchange token, ethereum, ethereum token, erc20, futures, perpetuals, futures protocol'
  const author = 'InjectiveProtocol'

  const appMetaTags = () => [
    {
      hid: 'og:url',
      property: 'og:url',
      content: `${BASE_URL}`
    },
    { hid: 'keywords', name: 'keywords', content: keywords },
    { hid: 'description', name: 'description', content: description },
    { hid: 'author', name: 'author', content: author },
    { hid: 'og:type', property: 'og:type', content: 'exchange' },
    {
      hid: 'og:image',
      property: 'og:image',
      content: `${BASE_URL}/images/og.jpeg`
    },
    {
      hid: 'og:description',
      property: 'og:description',
      content: description
    },
    {
      hid: 'twitter:card',
      property: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      hid: 'twitter:site',
      property: 'twitter:site',
      content: '@InjectiveLabs'
    },
    {
      name: 'twitter:image',
      content: `${BASE_URL}/images/og.jpeg`
    },
    {
      hid: 'twitter:creator',
      property: 'twitter:creator',
      content: '@InjectiveLabs'
    },
    {
      hid: 'twitter:description',
      property: 'twitter:description',
      content: description
    },
    {
      hid: 'twitter:title',
      property: 'twitter:title',
      content: title
    },
    { hid: 'og:title', property: 'og:title', content: title },
    { hid: 'og:site_name', property: 'og:site_name', content: title },
    { hid: 'title', property: 'title', content: title }
  ]

  const pwaMetaTags = () => {
    return {
      name: title,
      description,
      // theme_color: 'dark',
      ogSiteName: title,
      ogTitle: title,
      ogDescription: description,
      ogHost: 'https://injective.exchange',
      ogUrl: 'https://injective.exchange',
      ogImage: `${BASE_URL}/images/og.jpeg`,
      twitterCard: 'summary_large_image',
      twitterSite: '@InjectiveLabs',
      twitterCreator: '@InjectiveLabs'
    }
  }

  const manifestMetaTags = () => {
    return {
      name: title,
      description,
      short_name: 'Injective Exchange'
      // theme_color: 'dark'
    }
  }

  return {
    appMetaTags,
    pwaMetaTags,
    manifestMetaTags
  }
}

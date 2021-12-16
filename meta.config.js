const { BASE_URL } = require('./app/utils/constants')

const metaTags = {
  headTitle:
    'Injective Exchange - DeFi DEX | Decentralized Derivatives Trading. Any Market. Anytime. Anywhere.',
  title:
    'Injective Protocol - Decentralized Derivatives Trading. Any Market. Anytime. Anywhere.',
  description:
    'Injective is the first front-running resistant, layer-2 exchange protocol that unlocks the full potential of borderless finance by supporting margin trading, derivatives, and futures.',
  keywords:
    'injective protocol, dapp, decentralized app, cryptocurrency, criptocurrency exchange, exchange, exchange token, ethereum, ethereum token, erc20, futures, perpetuals, futures protocol',
  author: 'InjectiveLabs',
  url: 'https://injective.exchange'
}

const nuxtMetaTags = [
  {
    hid: 'og:url',
    property: 'og:url',
    content: `${BASE_URL}`
  },
  { hid: 'keywords', name: 'keywords', content: metaTags.keywords },
  { hid: 'description', name: 'description', content: metaTags.description },
  { hid: 'author', name: 'author', content: metaTags.author },
  { hid: 'og:type', property: 'og:type', content: 'exchange' },
  {
    hid: 'og:image',
    property: 'og:image',
    content: `${BASE_URL}/images/og.jpeg`
  },
  {
    hid: 'og:description',
    property: 'og:description',
    content: metaTags.description
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
    content: metaTags.description
  },
  {
    hid: 'twitter:title',
    property: 'twitter:title',
    content: metaTags.title
  },
  { hid: 'og:title', property: 'og:title', content: metaTags.title },
  { hid: 'og:site_name', property: 'og:site_name', content: metaTags.title },
  { hid: 'title', property: 'title', content: metaTags.title }
]

const pwaMetaTags = {
  name: metaTags.title,
  description: metaTags.description,
  ogSiteName: metaTags.title,
  ogTitle: metaTags.title,
  ogDescription: metaTags.description,
  ogHost: metaTags.url,
  ogUrl: metaTags.url,
  ogImage: `${BASE_URL}/images/og.jpeg`,
  twitterCard: 'summary_large_image',
  twitterSite: '@InjectiveLabs',
  twitterCreator: '@InjectiveLabs'
}

const manifestMetaTags = {
  name: metaTags.title,
  description: metaTags.description,
  short_name: 'Injective DEX'
}

module.exports = {
  metaTags,
  nuxtMetaTags,
  pwaMetaTags,
  manifestMetaTags
}

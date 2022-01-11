const { BASE_URL } = require('./app/utils/constants')

const metaTags = {
  title: process.env.APP_NAME
    ? process.env.APP_NAME
    : 'Injective Pro: Decentralized Cryptocurrency Derivatives, Ethereum and Altcoin Exchange',
  description:
    'Injective is the first front-running resistant, layer-2 exchange protocol that unlocks the full potential of borderless finance by supporting margin trading, derivatives, and futures.',
  keywords:
    'injective protocol, dapp, decentralized app, cryptocurrency, criptocurrency exchange, exchange, exchange token, ethereum, ethereum token, erc20, futures, perpetuals, futures protocol',
  author: 'InjectiveLabs',
  url: 'https://injective.exchange',
  shortName: 'Injective Pro DEX',
  twitterHandle: '@InjectiveLabs',
  ogImage: `${BASE_URL}/images/og.jpeg` // Change this to another image (change the name of the file as well to clear cache from social media)
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
    content: metaTags.ogImage
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
    content: metaTags.twitterHandle
  },
  {
    name: 'twitter:image',
    content: metaTags.ogImage
  },
  {
    hid: 'twitter:creator',
    property: 'twitter:creator',
    content: metaTags.twitterHandle
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
  ogImage: metaTags.ogImage,
  twitterCard: 'summary_large_image',
  twitterSite: '@InjectiveLabs',
  twitterCreator: '@InjectiveLabs'
}

const manifestMetaTags = {
  name: metaTags.title,
  description: metaTags.description,
  short_name: metaTags.shortName
}

module.exports = {
  metaTags,
  nuxtMetaTags,
  pwaMetaTags,
  manifestMetaTags
}

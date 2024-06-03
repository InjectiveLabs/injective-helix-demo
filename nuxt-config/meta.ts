export const metaTags = {
  title: process.env.VITE_NAME
    ? process.env.VITE_NAME
    : 'Helix | Open Finance Reimagined',
  description:
    'Trade on Helix - the premier decentralized spot and derivatives exchange with low fees and gas free execution',
  keywords:
    'injective protocol, dapp, decentralized app, cryptocurrency, cryptocurrency exchange, exchange, ethereum, erc20, futures, perpetuals, futures protocol, cosmos, spot trading, derivatives, injective, ibc, cross-chain',
  author: 'InjectiveLabs',
  url: 'https://helixapp.com',
  shortName: 'Helix',
  twitterHandle: '@InjectiveLabs',
  ogImage: `${process.env.VITE_BASE_URL}/images/og-helix.jpeg`
}

export const nuxtMetaTags = [
  {
    hid: 'og:url',
    property: 'og:url',
    content: `${process.env.VITE_BASE_URL}`
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

export const pwaMetaTags = {
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

export const manifestMetaTags = {
  name: metaTags.title,
  description: metaTags.description,
  short_name: metaTags.shortName
}

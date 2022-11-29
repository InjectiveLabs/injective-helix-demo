const prodModules = []

if (process.env.APP_BUGSNAG_KEY) {
  prodModules.push([
    'nuxt-bugsnag',
    {
      apiKey: process.env.APP_BUGSNAG_KEY,
      config: {
        appVersion: process.env.npm_package_version,
        releaseStage: process.env.APP_ENV || 'development',
        enabledReleaseStages: ['production', 'testnet', 'mainnet', 'staging']
      },
      publishRelease: true
    }
  ])
}

module.exports = [
  ...[
    '@nuxtjs/pwa',
    'portal-vue/nuxt',
    '@nuxtjs/toast',
    '@nuxtjs/google-gtag',
    '@nuxtjs/sitemap',
    '@nuxtjs/vendor'
  ],
  ...(process.env.NODE_ENV === 'production' ? prodModules : [])
]

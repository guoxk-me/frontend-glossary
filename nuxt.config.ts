import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'

// AI modified: ship pre-rendered content and an explicit offline cache without a business backend.
export default defineNuxtConfig({
  compatibilityDate: '2026-10-27',
  devtools: { enabled: false },
  // AI modified: diagnostics are development-only and never enter the static PWA.
  $development: {
    devtools: { enabled: true },
    modules: ['@nuxt/hints', '@nuxt/a11y'],
  },
  modules: [
    '@nuxt/content',
    '@nuxt/icon',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@pinia/nuxt',
    'shadcn-nuxt',
    '@nuxt/eslint',
    '@vite-pwa/nuxt',
  ],
  // AI modified: bundle icons locally so the static PWA never needs an icon API.
  icon: {
    provider: 'none',
    mode: 'svg',
    size: '24px',
    clientBundle: {
      scan: true,
      // The demo menu selects these icons dynamically.
      icons: [
        'lucide:layout-dashboard',
        'lucide:package',
        'lucide:users',
        'lucide:settings',
        // AI modified: template filter icons use authored names rather than literal Icon props.
        'lucide:layout-template',
        'lucide:panel-top',
        'lucide:panels-top-left',
        'lucide:sparkles',
        'lucide:palette',
        'lucide:mouse-pointer-2',
      ],
    },
  },
  // AI modified: explicit locale routes keep old links and local scheme identities intact.
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'zh',
    locales: [
      { code: 'zh', language: 'zh-CN', name: '简体中文' },
      { code: 'en', language: 'en-US', name: 'English' },
    ],
    detectBrowserLanguage: false,
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'frontend-glossary:theme',
  },
  site: {
    url: 'https://front.guoxk.me',
    name: '前端词典',
  },
  sitemap: {
    zeroRuntime: true,
    include: [
      '/',
      '/about',
      '/terms/**',
      '/templates',
      '/templates/**',
      '/en',
      '/en/about',
      '/en/terms/**',
      '/en/templates',
      '/en/templates/**',
    ],
  },
  // AI modified: browser-local pages are usable but should not appear in search results.
  routeRules: {
    '/favorites': { robots: false },
    '/en/favorites': { robots: false },
    '/en/schemes': { robots: false },
    '/en/schemes/**': { robots: false },
    '/schemes': { robots: false },
    '/schemes/**': { robots: false },
  },
  imports: { autoImport: false },
  content: {
    experimental: { sqliteConnector: 'native' },
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  typescript: { strict: true },
  eslint: {
    config: { standalone: false },
  },
  shadcn: { prefix: 'Ui', componentDir: '~/components/ui' },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '前端词典',
      // AI modified: migrate the old VueUse preference before Nuxt's first-paint theme script.
      script: [
        {
          key: 'theme-preference-migration',
          tagPriority: 'critical',
          innerHTML: 'try{const key=\'frontend-glossary:theme\';if(localStorage.getItem(key)===\'auto\')localStorage.setItem(key,\'system\')}catch{}',
        },
      ],
      meta: [
        { name: 'description', content: '看见效果，找到名字。查阅前端布局、动效与交互，把想法变成清楚的需求。' },
      ],
      link: [
        { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
      ],
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: [
        '/',
        '/templates',
        '/templates/customer-management',
        '/en/templates',
        '/en/templates/customer-management',
        '/favorites',
        '/schemes',
        '/schemes/edit',
        '/about',
        '/en',
        '/en/about',
        '/en/favorites',
        '/en/schemes',
        '/en/schemes/edit',
      ],
    },
  },
  pwa: {
    registerType: 'prompt',
    client: { installPrompt: true },
    manifest: {
      name: '前端词典',
      short_name: '前端词典',
      description: '看见效果，找到名字',
      lang: 'zh-CN',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: '#18181b',
      background_color: '#ffffff',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,json,svg,png,ico,wasm,db,txt}'],
      maximumFileSizeToCacheInBytes: 6000000,
      navigateFallback: '/200',
      // AI modified: Nuxt appends its build ID to payload requests; content dumps also need precaching.
      ignoreURLParametersMatching: [/^_b$/, /^utm_/, /^fbclid$/],
      cleanupOutdatedCaches: true,
    },
  },
})

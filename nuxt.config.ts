import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'

// AI modified: ship pre-rendered content and an explicit offline cache without a business backend.
export default defineNuxtConfig({
  compatibilityDate: '2026-10-27',
  devtools: { enabled: false },
  modules: [
    '@nuxt/content',
    '@pinia/nuxt',
    'shadcn-nuxt',
    '@nuxt/eslint',
    '@vite-pwa/nuxt',
  ],
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
        '/favorites',
        '/schemes',
        '/schemes/edit',
        '/about',
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

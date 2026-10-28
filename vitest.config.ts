import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

// AI modified: keep pure rule tests fast while exercising UI behavior in a real Nuxt environment.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['app/**/*.test.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.test.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: { domEnvironment: 'happy-dom' },
          },
        },
      }),
    ],
  },
})

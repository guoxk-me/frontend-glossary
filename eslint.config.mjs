import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(antfu({
  vue: true,
  typescript: true,
  ignores: [
    'docs/prototypes/**',
    '.data/**',
    'playwright-report/**',
    'test-results/**',
  ],
}), {
  // AI modified: content frontmatter must be parsed as YAML instead of Markdown link syntax.
  name: 'glossary/markdown-frontmatter',
  files: ['**/*.md'],
  languageOptions: { frontmatter: 'yaml' },
})

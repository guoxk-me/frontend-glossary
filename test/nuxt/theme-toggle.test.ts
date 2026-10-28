import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { useColorMode } from '#imports'
import ThemeToggle from '../../app/components/ThemeToggle.vue'

it('使用 Nuxt 主题状态在系统、浅色和深色之间切换', async () => {
  const colorMode = useColorMode()
  colorMode.preference = 'system'
  const wrapper = await mountSuspended(ThemeToggle)
  try {
    expect(wrapper.get('button').attributes('aria-label')).toContain('跟随系统')
    for (const label of ['浅色', '深色', '跟随系统']) {
      await wrapper.get('button').trigger('click')
      await flushPromises()
      expect(wrapper.get('button').attributes('aria-label')).toContain(label)
    }
    expect(colorMode.preference).toBe('system')
  }
  finally { wrapper.unmount() }
})

import type { VueWrapper } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it } from 'vitest'
import CollapsePanel from '../../app/components/CollapsePanel.vue'
import InteractionDemo from '../../app/components/demos/InteractionDemo.vue'
import { defaultParameters } from '../../app/lib/glossary'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

// AI modified: transitions must preserve inputs and keyboard behavior while state changes immediately.
describe('动效中的交互边界', () => {
  it('连续展开收起保留输入，关闭内容立即退出键盘访问', async () => {
    wrapper = await mountSuspended(CollapsePanel, {
      props: { open: false },
      slots: { default: '<input aria-label="业务备注">' },
    })
    expect(wrapper.find('input').exists()).toBe(false)
    await wrapper.setProps({ open: true })
    await wrapper.get('input').setValue('保留这条备注')
    await wrapper.setProps({ open: false })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('inert')).toBeDefined()
    await wrapper.setProps({ open: true })
    expect(wrapper.get('input').element.value).toBe('保留这条备注')
    expect(wrapper.attributes('aria-hidden')).toBe('false')
    expect(wrapper.attributes('inert')).toBeUndefined()
  })
  it('浮层 Escape 关闭并立即返回触发按钮', async () => {
    wrapper = await mountSuspended(InteractionDemo, {
      props: {
        kind: 'popover',
        parameters: defaultParameters(),
      },
      attachTo: document.body,
    })
    const trigger = wrapper.get('button')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
    wrapper.get('input').element.focus()
    await wrapper.get('input').trigger('keydown', { key: 'Escape' })
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger.element)
    expect(wrapper.get('.popover-content').attributes('inert')).toBeDefined()
  })
  it('标签键盘切换不等待淡入，连续加载到末尾不丢焦点', async () => {
    wrapper = await mountSuspended(InteractionDemo, {
      props: {
        kind: 'tabs',
        parameters: defaultParameters(),
      },
      attachTo: document.body,
    })
    await wrapper.get('[role=tab]').trigger('keydown', { key: 'ArrowRight' })
    const selected = wrapper.get('[role=tab][aria-selected=true]')
    expect(selected.text()).toBe('成员')
    expect(document.activeElement).toBe(selected.element)
    await wrapper.setProps({ kind: 'load-more' })
    const load = wrapper.get<HTMLButtonElement>('.load-more-example button')
    load.element.focus()
    await load.trigger('click')
    await load.trigger('click')
    await load.trigger('click')
    expect(wrapper.findAll('.mini-row')).toHaveLength(9)
    expect(document.activeElement).toBe(load.element)
    expect(load.attributes('aria-disabled')).toBe('true')
  })
})

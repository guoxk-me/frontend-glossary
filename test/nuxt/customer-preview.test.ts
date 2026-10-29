import type { VueWrapper } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import CustomerManagementDemo from '../../app/components/templates/CustomerManagementDemo.vue'
import TemplateFullscreenPreview from '../../app/components/templates/TemplateFullscreenPreview.vue'
import { previewCustomers } from '../../app/lib/customer-preview'
import { useLibraryStore } from '../../app/stores/library'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})
async function click(label: string): Promise<void> {
  const button = [
    ...document.querySelectorAll<HTMLButtonElement>('button'),
  ].find(button => button.textContent?.trim() === label || button.getAttribute('aria-label') === label)
  expect(button, `Missing button: ${label}`).toBeDefined()
  button!.click()
  await flushPromises()
}
async function fill(selector: string, text: string): Promise<void> {
  const input = document.querySelector<HTMLInputElement>(selector)!
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flushPromises()
}

// AI modified: verify visible actions and ensure demo mutations never enter the personal library.
describe('客户模板可操作预览', () => {
  it('真实筛选和分页，筛选变化后回到首页并显示空结果', async () => {
    wrapper = await mountSuspended(CustomerManagementDemo, { attachTo: document.body })
    expect(wrapper.findAll('tbody tr')).toHaveLength(5)
    expect(wrapper.text()).toContain('第 1 / 3 页')
    await click('下一页')
    expect(wrapper.text()).toContain('第 2 / 3 页')
    expect(wrapper.find('tbody').text()).toContain('一木建筑')
    await wrapper.get('select[aria-label="客户状态"]').setValue('active')
    expect(wrapper.text()).toContain('第 1 / 1 页')
    expect(wrapper.findAll('tbody tr')).toHaveLength(4)
    await wrapper.get('select[aria-label="负责人"]').setValue('lin')
    expect(wrapper.text()).toContain('没有匹配的客户')
    await click('清除筛选')
    await wrapper.get('input[type="search"]').setValue('Distant')
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.find('tbody').text()).toContain('远山设计工作室')
  })
  it('新增客户可查看和更新状态，活动与概览同步，但不修改方案和初始样例', async () => {
    const library = useLibraryStore()
    const before = JSON.stringify(library.$state)
    const originalCustomers = JSON.stringify(previewCustomers)
    wrapper = await mountSuspended(CustomerManagementDemo, { attachTo: document.body })
    await click('新增客户')
    await fill('#preview-customer-name', '交互测试客户')
    await fill('#preview-customer-contact', '演示联系人')
    await click('添加客户')
    expect(wrapper.find('tbody').text()).toContain('交互测试客户')
    expect(wrapper.text()).toContain('共 13 位客户')
    await click('查看客户 交互测试客户')
    const status = document.querySelector<HTMLSelectElement>('#preview-customer-status')!
    status.value = 'active'
    status.dispatchEvent(new Event('change', { bubbles: true }))
    await flushPromises()
    await click('更新状态')
    expect(wrapper.findAll('tbody tr')[0]!.text()).toContain('已合作')
    await click('活动记录')
    expect(wrapper.get('.customer-activity').text()).toContain('交互测试客户')
    expect(wrapper.get('.customer-activity').text()).toContain('更新了客户状态')
    await click('工作概览')
    expect(wrapper.get('.customer-overview').text()).toContain('13')
    expect(JSON.stringify(library.$state)).toBe(before)
    expect(JSON.stringify(previewCustomers)).toBe(originalCustomers)
  })
  it('全屏内展示真实控件，重置和重新打开恢复初始演示', async () => {
    wrapper = await mountSuspended(TemplateFullscreenPreview, {
      props: { src: '/templates/customer-management.png', title: '客户管理', demo: 'customer-management' },
      attachTo: document.body,
    })
    await click('全屏预览')
    expect(document.querySelector('.customer-workspace')).not.toBeNull()
    expect(document.querySelector('.fullscreen-canvas img')).toBeNull()
    await fill('input[type="search"]', '不存在的客户')
    expect(document.querySelector('.customer-preview-list')?.textContent).toContain('没有匹配的客户')
    await click('重置演示')
    expect(document.querySelector('.customer-preview-list')?.textContent).toContain('共 12 位客户')
    await fill('input[type="search"]', 'Distant')
    await click('关闭')
    await click('全屏预览')
    expect(document.querySelector<HTMLInputElement>('input[type="search"]')?.value).toBe('')
    expect(document.querySelector('.customer-preview-list')?.textContent).toContain('共 12 位客户')
  })
})

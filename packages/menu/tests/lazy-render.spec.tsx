import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Menu from '../src'

async function flushMenu() {
  await Promise.resolve()
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

const items = [
  {
    key: 'sub1',
    label: 'Submenu',
    children: [
      { key: 'sub1-0', label: 'Item 0' },
      { key: 'sub1-1', label: 'Item 1' },
      { key: 'sub1-2', label: 'Item 2' },
    ],
  },
  { key: 'other', label: 'Other' },
]

describe('inline submenu lazy render', () => {
  it('does not render closed submenu content until first open', async () => {
    const wrapper = mount(Menu, {
      props: { mode: 'inline', items, openKeys: [] },
    })
    await flushMenu()

    // Like rc-menu CSSMotion without `forceRender`: no DOM before first open
    expect(wrapper.find('.vc-menu-sub').exists()).toBe(false)
    // Only the top-level plain item is in the DOM
    expect(wrapper.findAll('.vc-menu-item')).toHaveLength(1)

    await wrapper.setProps({ openKeys: ['sub1'] })
    await flushMenu()
    expect(wrapper.find('.vc-menu-sub').exists()).toBe(true)
    expect(wrapper.findAll('.vc-menu-sub .vc-menu-item')).toHaveLength(3)
    expect(wrapper.find('.vc-menu-submenu').classes()).toContain('vc-menu-submenu-open')
  })

  it('keeps submenu content mounted after close (removeOnLeave: false)', async () => {
    const wrapper = mount(Menu, {
      props: { mode: 'inline', items, openKeys: ['sub1'] },
    })
    await flushMenu()
    expect(wrapper.findAll('.vc-menu-sub .vc-menu-item')).toHaveLength(3)

    await wrapper.setProps({ openKeys: [] })
    await flushMenu()
    // DOM is kept and only hidden, matching rc-menu's `removeOnLeave: false`
    expect(wrapper.find('.vc-menu-sub').exists()).toBe(true)
    expect(wrapper.find('.vc-menu-submenu').classes()).not.toContain('vc-menu-submenu-open')

    await wrapper.setProps({ openKeys: ['sub1'] })
    await flushMenu()
    expect(wrapper.find('.vc-menu-submenu').classes()).toContain('vc-menu-submenu-open')
  })

  it('renders closed submenu content with forceSubMenuRender', async () => {
    const wrapper = mount(Menu, {
      props: { mode: 'inline', items, openKeys: [], forceSubMenuRender: true },
    })
    await flushMenu()

    expect(wrapper.find('.vc-menu-sub').exists()).toBe(true)
    expect(wrapper.findAll('.vc-menu-sub .vc-menu-item')).toHaveLength(3)
  })

  it('still highlights parent submenu of a selected key while closed', async () => {
    const wrapper = mount(Menu, {
      props: { mode: 'inline', items, openKeys: [], selectedKeys: ['sub1-0'] },
    })
    await flushMenu()

    // Path registration comes from the hidden measure tree, so the parent
    // submenu must be marked selected even though its content is not rendered.
    expect(wrapper.find('.vc-menu-sub').exists()).toBe(false)
    expect(wrapper.find('.vc-menu-submenu').classes()).toContain('vc-menu-submenu-selected')
  })
})

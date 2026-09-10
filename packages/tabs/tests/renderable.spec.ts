import type { TabsProps } from '../src'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Tabs from '../src'

// Mirrors rc-tabs "use renderable guards for tab content" (#1021): `0` is a
// renderable value and must not be swallowed by `||` / `&&` fallbacks.
describe('@v-c/tabs renderable guards', () => {
  it('renders `0` as a tab icon and label', () => {
    const items: NonNullable<TabsProps['items']> = [
      { key: '1', label: 0 as any, icon: 0 as any },
    ]
    const wrapper = mount(Tabs, { props: { activeKey: '1', items } })

    expect(wrapper.find('.vc-tabs-tab-icon').exists()).toBe(true)
    expect(wrapper.find('.vc-tabs-tab-icon').text()).toBe('0')
    expect(wrapper.find('.vc-tabs-tab-btn').text()).toBe('00')
  })

  it('does not render an icon wrapper for an empty icon', () => {
    const items: NonNullable<TabsProps['items']> = [
      { key: '1', label: 'tab', icon: '' as any },
    ]
    const wrapper = mount(Tabs, { props: { activeKey: '1', items } })

    expect(wrapper.find('.vc-tabs-tab-icon').exists()).toBe(false)
  })

  it('renders `0` as closeIcon / removeIcon / addIcon instead of the defaults', () => {
    const items: NonNullable<TabsProps['items']> = [
      { key: '1', label: 'a', closeIcon: 0 as any },
      { key: '2', label: 'b' },
    ]
    const wrapper = mount(Tabs, {
      props: {
        activeKey: '1',
        items,
        editable: { onEdit: () => {}, removeIcon: 0 as any, addIcon: 0 as any },
      },
    })

    const removes = wrapper.findAll('.vc-tabs-tab-remove')
    expect(removes).toHaveLength(2)
    expect(removes[0].text()).toBe('0')
    expect(removes[1].text()).toBe('0')
    expect(wrapper.find('.vc-tabs-nav-add').text()).toBe('0')
  })

  it('falls back to default icons when none are provided', () => {
    const items: NonNullable<TabsProps['items']> = [
      { key: '1', label: 'a' },
    ]
    const wrapper = mount(Tabs, {
      props: { activeKey: '1', items, editable: { onEdit: () => {} } },
    })

    expect(wrapper.find('.vc-tabs-tab-remove').text()).toBe('×')
    expect(wrapper.find('.vc-tabs-nav-add').text()).toBe('+')
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Menu from '../src'

// ref: react-component/menu#897
describe('menu icon renderability', () => {
  it('renders a global zero item icon', () => {
    const wrapper = mount(() => <Menu itemIcon={0 as any} items={[{ key: 'a', label: 'A' }]} />)
    expect(wrapper.find('.vc-menu-item').text()).toBe('A0')
  })

  it('lets a zero item icon override the global icon', () => {
    const wrapper = mount(() => (
      <Menu itemIcon={'GLOBAL' as any} items={[{ key: 'a', label: 'A', itemIcon: 0 as any }]} />
    ))
    expect(wrapper.find('.vc-menu-item').text()).toBe('A0')
  })

  it.each([0, false, null])('preserves the expand icon %s', (expandIcon) => {
    const wrapper = mount(() => (
      <Menu
        mode="inline"
        expandIcon={expandIcon as any}
        items={[{ key: 'a', label: 'A', children: [{ key: 'b', label: 'B' }] }]}
      />
    ))
    expect(wrapper.find('.vc-menu-submenu-title').text()).toBe(expandIcon === 0 ? 'A0' : 'A')
    expect(wrapper.find('.vc-menu-submenu-arrow').exists()).toBe(false)
  })
})

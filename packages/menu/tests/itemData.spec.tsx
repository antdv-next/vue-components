import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import Menu, { Item as MenuItem } from '../src'

async function flushMenu() {
  await Promise.resolve()
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('menu onClick/onSelect itemData payload', () => {
  it('reports the resolved icon in itemData for items mode', async () => {
    const onClick = vi.fn()
    const iconNode = h('span', { class: 'leading-icon' })
    const wrapper = mount(Menu, {
      props: {
        onClick,
        items: [
          { key: '1', label: 'Option 1', icon: iconNode, extra: 'X' },
        ],
      },
    })

    await flushMenu()
    await wrapper.find('.vc-menu-item').trigger('click')

    expect(onClick).toHaveBeenCalled()
    const { itemData } = onClick.mock.calls[0][0]
    expect(itemData.key).toBe('1')
    expect(itemData.label).toBe('Option 1')
    expect(itemData.extra).toBe('X')
    // Regression: itemData must report the displayed icon, not undefined
    expect(itemData.itemIcon).toBe(iconNode)
  })

  it('passes the full item object through itemData in items mode', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Menu, {
      props: {
        onClick,
        items: [
          { key: '1', label: 'Option 1', title: 'tooltip text', customField: 'custom' } as any,
        ],
      },
    })

    await flushMenu()
    await wrapper.find('.vc-menu-item').trigger('click')

    expect(onClick).toHaveBeenCalled()
    const { itemData } = onClick.mock.calls[0][0]
    expect(itemData.title).toBe('tooltip text')
    expect(itemData.customField).toBe('custom')
  })

  it('builds itemData from props in children mode', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Menu, {
      props: { onClick },
      slots: {
        default: () => h(MenuItem, { key: 'a', extra: 'Y' }, { default: () => 'Child' }),
      },
    })

    await flushMenu()
    await wrapper.find('.vc-menu-item').trigger('click')

    expect(onClick).toHaveBeenCalled()
    const { itemData } = onClick.mock.calls[0][0]
    expect(itemData.key).toBe('a')
    expect(itemData.extra).toBe('Y')
  })
})

// react-component/menu#894
describe('menu item extra renderable guard', () => {
  it('renders numeric 0 extra but skips empty string extra', () => {
    const wrapper = mount(Menu, {
      props: {
        mode: 'inline',
        items: [
          { key: 'zero', label: 'Zero', extra: 0 },
          { key: 'empty', label: 'Empty', extra: '' },
        ],
      },
    })

    const extras = wrapper.findAll('.vc-menu-item-extra')
    expect(extras).toHaveLength(1)
    expect(extras[0].text()).toBe('0')
  })
})

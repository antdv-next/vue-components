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

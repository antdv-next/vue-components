import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import Menu, { Item as MenuItem, SubMenu } from '../src'

async function flushMenuSelection() {
  await Promise.resolve()
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('menu selection state', () => {
  it('marks parent submenu as selected when a child item is selected on initial render', async () => {
    const wrapper = mount(Menu, {
      props: {
        mode: 'inline',
        openKeys: ['sub1'],
        selectedKeys: ['item1'],
      },
      slots: {
        default: () =>
          h(SubMenu, { key: 'sub1', title: 'submenu' }, {
            default: () => [
              h(MenuItem, { key: 'item1' }, {
                default: () => 'item',
              }),
            ],
          }),
      },
    })

    await flushMenuSelection()

    expect(wrapper.find('.vc-menu-item-selected').exists()).toBe(true)
    expect(wrapper.find('.vc-menu-submenu-selected').exists()).toBe(true)
  })

  it('marks parent submenu as selected for controlled items data on initial render', async () => {
    const wrapper = mount(Menu, {
      props: {
        mode: 'inline',
        openKeys: ['sub1'],
        selectedKeys: ['1'],
        items: [
          {
            key: 'sub1',
            label: 'Navigation One',
            children: [
              {
                key: 'g1',
                label: 'Item 1',
                type: 'group',
                children: [
                  { key: '1', label: 'Option 1' },
                  { key: '2', label: 'Option 2' },
                ],
              },
            ],
          },
        ],
      },
    })

    await flushMenuSelection()

    expect(wrapper.find('.vc-menu-item-selected').text()).toContain('Option 1')
    expect(wrapper.find('.vc-menu-submenu-selected').exists()).toBe(true)
  })
})

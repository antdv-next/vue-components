import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Menu from '../src'

async function flushMenuSelection() {
  await Promise.resolve()
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

const loadedItems = [
  {
    key: 'parent',
    label: 'Parent',
    children: [
      {
        type: 'group',
        label: 'Group',
        children: [{ key: 'child', label: 'Child' }],
      },
    ],
  },
]

// react-component/menu#895
describe('menu dynamic selection', () => {
  describe.each(['defaultSelectedKeys', 'selectedKeys'] as const)('%s', (selectionProp) => {
    it.each(['inline', 'vertical', 'horizontal'] as const)(
      'highlights the parent and child when items load in %s mode',
      async (mode) => {
        const wrapper = mount(Menu, {
          props: {
            mode,
            [selectionProp]: ['child'],
            items: [],
            forceSubMenuRender: true,
          },
        })
        await flushMenuSelection()
        expect(wrapper.find('.vc-menu-submenu').exists()).toBe(false)

        await wrapper.setProps({ items: loadedItems as any })
        await flushMenuSelection()

        expect(wrapper.get('.vc-menu-submenu').classes()).toContain('vc-menu-submenu-selected')
        const children = document.body.querySelectorAll('.vc-menu-item')
        expect(children.length).toBeGreaterThan(0)
        children.forEach((child) => {
          expect(child.classList.contains('vc-menu-item-selected')).toBe(true)
        })

        wrapper.unmount()
      },
    )
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import Menu, { Item as MenuItem, SubMenu } from '../src'

describe('semantic', () => {
  it('supports classes and styles for SubMenu self nodes', () => {
    const classes = {
      subItem: 'test-sub-item',
      subItemTitle: 'test-sub-item-title',
    }
    const styles = {
      subItem: { width: '200px' },
      subItemTitle: { whiteSpace: 'normal' as const },
    }
    const createSubMenu = (key: string, title: string, children: () => any) =>
      h(SubMenu, { key, title, classes, styles }, { default: children })

    const wrapper = mount(Menu, {
      props: {
        mode: 'inline',
        openKeys: ['s1', 's1-2'],
      },
      slots: {
        default: () => createSubMenu('s1', 'submenu1', () =>
          createSubMenu('s1-2', 'submenu1-1', () =>
            h(MenuItem, { key: 's1-2-1' }, () => '2-1'))),
      },
    })

    const subItems = wrapper.findAll('.vc-menu-submenu')
    const subItemTitles = wrapper.findAll('.vc-menu-submenu-title')

    expect(subItems).toHaveLength(2)
    expect(subItemTitles).toHaveLength(2)
    subItems.forEach((subItem) => {
      expect(subItem.classes()).toContain(classes.subItem)
      expect(subItem.attributes('style')).toContain('width: 200px')
    })
    subItemTitles.forEach((subItemTitle) => {
      expect(subItemTitle.classes()).toContain(classes.subItemTitle)
      expect(subItemTitle.attributes('style')).toContain('white-space: normal')
    })
  })
})

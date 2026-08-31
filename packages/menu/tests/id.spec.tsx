import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import Menu, { Item as MenuItem, SubMenu } from '../src'

let id = 0

vi.mock('@v-c/util/dist/hooks/useId', () => ({
  default: (customId?: string) => customId ?? `mock-id-${++id}`,
}))

function createMenu(customId?: string) {
  return mount(Menu, {
    props: {
      id: customId,
      mode: 'inline',
      openKeys: ['sub'],
    },
    slots: {
      default: () => h(SubMenu, { key: 'sub', title: 'Submenu' }, {
        default: () => h(MenuItem, { key: 'item' }, () => 'Item'),
      }),
    },
  })
}

describe('menu ids', () => {
  beforeEach(() => {
    id = 0
  })

  it('generates distinct popup ids across menu instances', () => {
    const first = createMenu()
    const second = createMenu()
    const firstPopupId = first.find('.vc-menu-submenu-title').attributes('aria-controls')
    const secondPopupId = second.find('.vc-menu-submenu-title').attributes('aria-controls')

    expect(firstPopupId).not.toBe(secondPopupId)
  })

  it('preserves a provided menu id', () => {
    const wrapper = createMenu('custom-menu')

    expect(wrapper.find('.vc-menu-submenu-title').attributes('aria-controls'))
      .toBe('custom-menu-sub-popup')
  })
})

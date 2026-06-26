import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import Menu, { Item as MenuItem, SubMenu } from '../src'

async function flushMenu() {
  await Promise.resolve()
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('menu events fire exactly once', () => {
  it('item onClick from items config fires once with info payload', async () => {
    const itemClick = vi.fn()
    const menuClick = vi.fn()
    const wrapper = mount(Menu, {
      props: {
        onClick: menuClick,
        items: [
          { key: '1', label: 'Option 1', onClick: itemClick },
        ],
      },
    })
    await flushMenu()

    await wrapper.find('.vc-menu-item').trigger('click')

    expect(itemClick).toHaveBeenCalledTimes(1)
    expect(menuClick).toHaveBeenCalledTimes(1)
    // The callback must receive the info object, not the raw DOM event
    const info = itemClick.mock.calls[0][0]
    expect(info.key).toBe('1')
    expect(info.domEvent).toBeInstanceOf(MouseEvent)
  })

  it('item onClick in children mode fires once', async () => {
    const itemClick = vi.fn()
    const wrapper = mount(Menu, {
      slots: {
        default: () => h(MenuItem, { key: 'a', onClick: itemClick }, { default: () => 'Child' }),
      },
    })
    await flushMenu()

    await wrapper.find('.vc-menu-item').trigger('click')

    expect(itemClick).toHaveBeenCalledTimes(1)
    expect(itemClick.mock.calls[0][0].key).toBe('a')
  })

  it('item onMouseEnter fires once', async () => {
    const mouseEnter = vi.fn()
    const wrapper = mount(Menu, {
      props: {
        items: [
          { key: '1', label: 'Option 1', onMouseEnter: mouseEnter },
        ],
      },
    })
    await flushMenu()

    await wrapper.find('.vc-menu-item').trigger('mouseenter')

    expect(mouseEnter).toHaveBeenCalledTimes(1)
    expect(mouseEnter.mock.calls[0][0].key).toBe('1')
  })

  it('submenu onClick and onTitleClick fire once', async () => {
    const subClick = vi.fn()
    const titleClick = vi.fn()
    const childClick = vi.fn()
    const wrapper = mount(Menu, {
      props: {
        mode: 'inline',
        openKeys: ['sub'],
        items: [
          {
            key: 'sub',
            label: 'Sub',
            onClick: subClick,
            onTitleClick: titleClick,
            children: [
              { key: 'c1', label: 'Child 1', onClick: childClick },
            ],
          },
        ],
      },
    })
    await flushMenu()

    await wrapper.find('.vc-menu-sub .vc-menu-item').trigger('click')
    // Child click bubbles through the submenu <li>; the submenu callback must
    // only be re-dispatched once with the info object, not also via the DOM
    expect(childClick).toHaveBeenCalledTimes(1)
    expect(subClick).toHaveBeenCalledTimes(1)
    expect(subClick.mock.calls[0][0].key).toBe('c1')
    expect(titleClick).not.toHaveBeenCalled()

    await wrapper.find('.vc-menu-submenu-title').trigger('click')
    expect(titleClick).toHaveBeenCalledTimes(1)
    expect(titleClick.mock.calls[0][0].key).toBe('sub')
  })

  it('children mode SubMenu does not leak private props to DOM', async () => {
    const wrapper = mount(Menu, {
      props: { mode: 'inline', openKeys: ['sub'] },
      slots: {
        default: () => h(SubMenu, { key: 'sub', title: 'Sub' }, {
          default: () => h(MenuItem, { key: 'c1' }, { default: () => 'Child' }),
        }),
      },
    })
    await flushMenu()

    const li = wrapper.find('.vc-menu-submenu')
    expect(li.attributes('eventkey')).toBeUndefined()
    expect(li.attributes('warnkey')).toBeUndefined()
  })
})

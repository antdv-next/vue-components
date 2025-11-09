import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import Menu, { Item as MenuItem, SubMenu } from '../src'
import Icon from '../src/Icon'

describe('icon', () => {
  it('should re-render when render props change', async () => {
    const renderIcon = vi.fn((info?: { isOpen?: boolean }) => {
      return h('span', { class: 'icon-content' }, info?.isOpen ? 'open' : 'close')
    })

    const wrapper = mount(Icon, {
      props: {
        icon: renderIcon,
        props: {
          isOpen: false,
        },
      },
    })

    expect(wrapper.html()).toContain('close')
    expect(renderIcon).toHaveBeenCalledTimes(1)

    await wrapper.setProps({
      props: {
        isOpen: true,
      },
    })

    await nextTick()

    expect(wrapper.html()).toContain('open')
    expect(renderIcon).toHaveBeenCalledTimes(2)
  })
})

describe('menu expand icon reactivity', () => {
  it('should update expandIcon render props when submenu toggles', async () => {
    const states: boolean[] = []
    const expandIcon = vi.fn((info?: { isOpen?: boolean }) => {
      states.push(!!info?.isOpen)
      console.log(info?.isOpen)
      return h('span', { class: 'expand-icon' }, info?.isOpen ? 'open' : 'close')
    })

    const wrapper = mount(Menu, {
      props: {
        mode: 'inline',
        expandIcon,
        openKeys: [],
      },
      slots: {
        default: () =>
          h(SubMenu, { key: 'sub1', title: 'submenu', expandIcon }, {
            default: () => [
              h(MenuItem, { key: 'item1' }, {
                default: () => 'item',
              }),
            ],
          }),
      },
    })

    await wrapper.setProps({ openKeys: ['sub1'] })
    await nextTick()
    await nextTick()

    expect(states.length).toBeGreaterThan(0)
    expect(states.at(-1)).toBe(true)
  })
})

describe('check span vnode', () => {
  it('should render span when icon is span vnode', async () => {
    const Proivder = defineComponent((_, { slots }) => {
      return () => slots?.default?.()
    })
    const A = defineComponent((_, { slots }) => {
      return () => {
        return h(Proivder, {}, slots)
      }
    })

    const wrapper = mount(h(A, { }, {
      default: () => h('span'),
    }), {})
    console.log(wrapper.html())
  })
})

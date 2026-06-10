import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import Menu from '../src'
import * as nodeUtil from '../src/utils/nodeUtil'

vi.mock(import('../src/utils/nodeUtil'), async (importOriginal) => {
  const mod = await importOriginal()
  return { ...mod, parseItems: vi.fn(mod.parseItems) }
})

const parseItemsSpy = vi.mocked(nodeUtil.parseItems)

async function flushMenu() {
  await Promise.resolve()
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('menu re-render behavior on openKeys change', () => {
  function createItems(labelRenderSpy: () => void, count = 50) {
    const LeafLabel = defineComponent({
      name: 'LeafLabel',
      props: { text: String },
      setup(props) {
        return () => {
          labelRenderSpy()
          return h('span', { class: 'leaf-label' }, props.text)
        }
      },
    })

    return [
      {
        key: 'sub1',
        label: 'Submenu',
        children: Array.from({ length: count }, (_, index) => ({
          key: `sub1-${index}`,
          label: h(LeafLabel, { text: `Item ${index}` }),
        })),
      },
      { key: 'other', label: 'Other' },
    ]
  }

  it('toggles inline submenu via controlled openKeys', async () => {
    const items = createItems(() => {})
    const wrapper = mount(Menu, {
      props: {
        mode: 'inline',
        items,
        openKeys: [],
      },
    })
    await flushMenu()

    await wrapper.setProps({ openKeys: ['sub1'] })
    await flushMenu()
    expect(wrapper.find('.vc-menu-sub').isVisible()).toBe(true)
    expect(wrapper.find('.vc-menu-submenu').classes()).toContain('vc-menu-submenu-open')

    // jsdom never fires transition end events, so assert the state class instead
    // of waiting for the leave transition to hide the list.
    await wrapper.setProps({ openKeys: [] })
    await flushMenu()
    expect(wrapper.find('.vc-menu-submenu').classes()).not.toContain('vc-menu-submenu-open')
  })

  it('does not re-parse items when only openKeys changes', async () => {
    const items = createItems(() => {})

    const wrapper = mount(Menu, {
      props: {
        mode: 'inline',
        items,
        openKeys: ['sub1'],
      },
    })
    await flushMenu()
    expect(parseItemsSpy).toHaveBeenCalled()
    const parseCountAfterMount = parseItemsSpy.mock.calls.length

    // Toggling controlled `openKeys` re-renders Menu itself, but the parsed
    // children must stay memoized (like rc-menu `useMemo`) so the whole vnode
    // tree (visible + measure list) is not rebuilt and re-patched per toggle.
    await wrapper.setProps({ openKeys: [] })
    await flushMenu()
    await wrapper.setProps({ openKeys: ['sub1'] })
    await flushMenu()

    expect(parseItemsSpy.mock.calls.length).toBe(parseCountAfterMount)
  })

  it('re-parses children when items prop changes', async () => {
    const labelRenderSpy = vi.fn()
    const wrapper = mount(Menu, {
      props: {
        mode: 'inline',
        items: createItems(labelRenderSpy, 2),
        openKeys: ['sub1'],
      },
    })
    await flushMenu()
    expect(wrapper.findAll('.leaf-label')).toHaveLength(2)

    await wrapper.setProps({ items: createItems(labelRenderSpy, 3) })
    await flushMenu()
    expect(wrapper.findAll('.leaf-label')).toHaveLength(3)
  })
})

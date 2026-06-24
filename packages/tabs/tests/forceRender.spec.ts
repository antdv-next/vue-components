import type { TabsProps } from '../src'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, onMounted, onUnmounted } from 'vue'
import Tabs from '../src'

// Tracks how many times each pane's content component is actually mounted.
// rc-tabs (React) lazily mounts a pane's content only after it first becomes
// active (CSSMotion with `forceRender`/lazy behaviour). `forceRender` is the
// escape hatch that mounts a pane immediately, even while inactive.
function makeTracker(mounted: string[], unmounted?: string[]) {
  return (key: string) =>
    defineComponent({
      name: `Pane-${key}`,
      setup() {
        onMounted(() => {
          mounted.push(key)
        })
        onUnmounted(() => {
          unmounted?.push(key)
        })
        return () => h('div', { class: `pane-content-${key}` }, `content ${key}`)
      },
    })
}

describe('@v-c/tabs forceRender / lazy render', () => {
  it('does NOT mount inactive panes that have never been active (lazy render)', () => {
    const mounted: string[] = []
    const T = makeTracker(mounted)
    const items: NonNullable<TabsProps['items']> = [
      { key: '1', label: 'tab 1', children: h(T('1')) },
      { key: '2', label: 'tab 2', children: h(T('2')) },
      { key: '3', label: 'tab 3', children: h(T('3')) },
    ]

    mount(Tabs, { props: { activeKey: '1', items } })

    // Expectation matching rc-tabs: only the active pane is mounted initially.
    expect(mounted).toEqual(['1'])
  })

  it('forceRender mounts an inactive pane immediately, others stay lazy', () => {
    const mounted: string[] = []
    const T = makeTracker(mounted)
    const items: NonNullable<TabsProps['items']> = [
      { key: '1', label: 'tab 1', children: h(T('1')) },
      { key: '2', label: 'tab 2', children: h(T('2')), forceRender: true },
      { key: '3', label: 'tab 3', children: h(T('3')) },
    ]

    mount(Tabs, { props: { activeKey: '1', items } })

    // Active pane (1) + forceRender pane (2) mounted; pane 3 stays lazy.
    expect(mounted.slice().sort()).toEqual(['1', '2'])
  })

  it('keeps a visited pane mounted after switching away (keep-alive)', async () => {
    const mounted: string[] = []
    const unmounted: string[] = []
    const T = makeTracker(mounted, unmounted)
    const items: NonNullable<TabsProps['items']> = [
      { key: '1', label: 'tab 1', children: h(T('1')) },
      { key: '2', label: 'tab 2', children: h(T('2')) },
    ]

    const wrapper = mount(Tabs, { props: { activeKey: '1', items } })
    expect(mounted).toEqual(['1'])

    // Switch to pane 2: it mounts, pane 1 stays mounted (not destroyed).
    await wrapper.setProps({ activeKey: '2' })
    expect(mounted.slice().sort()).toEqual(['1', '2'])
    expect(unmounted).toEqual([])
  })

  it('destroyOnHidden unmounts the pane when it becomes inactive', async () => {
    const mounted: string[] = []
    const unmounted: string[] = []
    const T = makeTracker(mounted, unmounted)
    const items: NonNullable<TabsProps['items']> = [
      { key: '1', label: 'tab 1', children: h(T('1')) },
      { key: '2', label: 'tab 2', children: h(T('2')) },
    ]

    const wrapper = mount(Tabs, { props: { activeKey: '1', items, destroyOnHidden: true } })
    expect(mounted).toEqual(['1'])

    await wrapper.setProps({ activeKey: '2' })
    // Pane 1 destroyed when hidden, pane 2 mounted.
    expect(mounted.slice().sort()).toEqual(['1', '2'])
    expect(unmounted).toEqual(['1'])
  })
})

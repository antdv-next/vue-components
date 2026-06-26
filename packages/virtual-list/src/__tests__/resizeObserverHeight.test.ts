import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import VirtualList from '../List'

// Item heights are re-measured through the container-level ResizeObserver
// (Filler `onInnerResize`), mirroring rc-virtual-list. There is intentionally no
// per-row ResizeObserver, so we mock `@v-c/resize-observer` to drive the
// container resize callbacks manually.
const { observers } = vi.hoisted(() => ({
  observers: [] as Array<{ getHandler: () => ((size: { offsetWidth: number, offsetHeight: number }) => void) | undefined }>,
}))

vi.mock('@v-c/resize-observer', async () => {
  const { defineComponent: defineMock } = await import('vue')
  return {
    default: defineMock({
      name: 'MockResizeObserver',
      props: ['onResize'],
      setup(props: any, { slots }: any) {
        observers.push({ getHandler: () => props.onResize })
        return () => slots.default?.()
      },
    }),
  }
})

function triggerContainerResize(size = { offsetWidth: 100, offsetHeight: 1000 }) {
  observers.forEach(o => o.getHandler()?.(size))
}

describe('virtualList container ResizeObserver heights', () => {
  it('re-measures and updates visible range when an item height changes', async () => {
    const originOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')
    const originOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')

    observers.length = 0

    try {
      // JSDOM does not calculate layout, mock the fields VirtualList relies on.
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        get() {
          return document.body
        },
        configurable: true,
      })

      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        get() {
          const height = (this as HTMLElement).style?.height
          const parsed = height ? Number.parseFloat(height) : NaN
          return Number.isFinite(parsed) ? parsed : 20
        },
        configurable: true,
      })

      const data = Array.from({ length: 100 }, (_, i) => ({ id: i }))

      const FragmentItem = defineComponent<{ height: number, label: string }>({
        props: {
          height: { type: Number, required: true },
          label: { type: String, required: true },
        },
        setup(p) {
          return () => [
            h('div', { style: { height: `${p.height}px` } }, p.label),
            h('span', 'tail'),
          ]
        },
      })

      const App = defineComponent({
        setup(_props, { expose }) {
          const firstHeight = ref(200)

          expose({
            setFirstHeight: (next: number) => {
              firstHeight.value = next
            },
          })

          return () =>
            h(
              VirtualList,
              {
                data,
                height: 40,
                itemHeight: 20,
                itemKey: 'id',
              },
              {
                default: ({ item }: any) =>
                  item.id === 0
                    ? h(FragmentItem, { height: firstHeight.value, label: `Item ${item.id}` })
                    : h('div', { style: { height: '20px' } }, `Item ${item.id}`),
              },
            )
        },
      })

      const wrapper = mount(App)

      // A container-level ResizeObserver must exist (Filler / holder).
      expect(observers.length).toBeGreaterThan(0)

      // Let initial height collection flush.
      await Promise.resolve()
      await nextTick()

      expect(wrapper.text()).toContain('Item 0')
      expect(wrapper.text()).toContain('Item 1')
      expect(wrapper.text()).not.toContain('Item 3')

      ;(wrapper.vm as any).setFirstHeight(20)
      await nextTick()

      // The shrunk first item changes the inner content height -> the container
      // ResizeObserver fires -> collectHeight re-measures.
      triggerContainerResize()
      await Promise.resolve()
      await nextTick()

      expect(wrapper.text()).toContain('Item 3')
    }
    finally {
      if (originOffsetParent) {
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', originOffsetParent)
      }
      if (originOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originOffsetHeight)
      }
    }
  })

  it('does not create a per-row ResizeObserver (no forced reflow amplifier)', async () => {
    // `useHeights` must rely on the container-level observer only. Re-introducing
    // a raw per-row `new window.ResizeObserver` would multiply forced reflows.
    const originResizeObserver = window.ResizeObserver
    const ctorSpy = vi.fn()

    class SpyResizeObserver {
      constructor(cb: any) {
        ctorSpy(cb)
      }

      observe() {}
      unobserve() {}
      disconnect() {}
    }

    try {
      Object.defineProperty(window, 'ResizeObserver', {
        value: SpyResizeObserver,
        configurable: true,
      })

      const data = Array.from({ length: 100 }, (_, i) => ({ id: i }))

      const wrapper = mount(VirtualList, {
        props: { data, height: 200, itemHeight: 20, itemKey: 'id' },
        slots: {
          default: ({ item }: any) => h('div', { style: { height: '20px' } }, `Item ${item.id}`),
        },
      })

      await Promise.resolve()
      await nextTick()

      // Container observers are mocked away (`@v-c/resize-observer`), so any
      // construction here would be a per-row observer regression.
      expect(ctorSpy).not.toHaveBeenCalled()

      wrapper.unmount()
    }
    finally {
      Object.defineProperty(window, 'ResizeObserver', {
        value: originResizeObserver,
        configurable: true,
      })
    }
  })
})

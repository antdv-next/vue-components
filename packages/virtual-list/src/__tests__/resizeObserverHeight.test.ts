import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import VirtualList from '../List'

describe('virtualList ResizeObserver heights', () => {
  it('should update visible range when item height changes', async () => {
    const originResizeObserver = window.ResizeObserver

    const originOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')
    const originOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')

    let observer: { trigger: () => void } | null = null

    class MockResizeObserver {
      private readonly cb: () => void

      constructor(cb: () => void) {
        this.cb = cb
        observer = this
      }

      observe() {}
      unobserve() {}
      disconnect() {}

      trigger() {
        this.cb()
      }
    }

    try {
      Object.defineProperty(window, 'ResizeObserver', {
        value: MockResizeObserver,
        configurable: true,
      })

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

      expect(observer).not.toBeNull()

      // Let initial height collection flush.
      await Promise.resolve()
      await nextTick()

      expect(wrapper.text()).toContain('Item 0')
      expect(wrapper.text()).toContain('Item 1')
      expect(wrapper.text()).not.toContain('Item 3')

      ;(wrapper.vm as any).setFirstHeight(20)
      await nextTick()

      observer!.trigger()
      await Promise.resolve()
      await nextTick()

      expect(wrapper.text()).toContain('Item 3')
    }
    finally {
      Object.defineProperty(window, 'ResizeObserver', {
        value: originResizeObserver,
        configurable: true,
      })

      if (originOffsetParent) {
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', originOffsetParent)
      }
      if (originOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originOffsetHeight)
      }
    }
  })
})

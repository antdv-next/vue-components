import { mount } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, watch } from 'vue'
import VirtualList from '../List'

function genData(count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: String(index) }))
}

function genList(dataRef: any, listRef: any) {
  return h(
    VirtualList,
    {
      ref: listRef,
      component: 'ul',
      data: dataRef.value,
      height: 100,
      itemHeight: 20,
      itemKey: 'id',
    },
    {
      default: ({ item }: any) => h('li', item.id),
    },
  )
}

describe('virtualList scrollTo key', () => {
  const originOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')
  const originOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
  const originClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
      get() {
        return document.body
      },
      configurable: true,
    })

    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      get() {
        return 20
      },
      configurable: true,
    })

    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      get() {
        return 100
      },
      configurable: true,
    })
  })

  afterAll(() => {
    if (originOffsetParent) {
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', originOffsetParent)
    }
    if (originOffsetHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originOffsetHeight)
    }
    if (originClientHeight) {
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', originClientHeight)
    }
  })

  it('refreshes key index when data changes', async () => {
    const Demo = defineComponent({
      setup() {
        const data = ref(genData(1))
        const listRef = ref<any>()

        function onClick() {
          // Data is replaced in the same tick, `props.data` of the list is still stale here
          data.value = genData(100)
          listRef.value.scrollTo({ key: '30', align: 'top' })
        }

        return () => h('div', [h('button', { onClick }), genList(data, listRef)])
      },
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await nextTick()

    await wrapper.find('button').trigger('click')
    await nextTick()

    const holderEl = wrapper.find('.vc-virtual-list-holder').element as HTMLUListElement
    expect(holderEl.scrollTop).toBe(600)

    wrapper.unmount()
  })

  it('retries key scroll when data changes after layout', async () => {
    const Demo = defineComponent({
      setup() {
        const data = ref(genData(1))
        const update = ref(false)
        const listRef = ref<any>()

        // Data only arrives after the list already tried to scroll
        watch(
          update,
          () => {
            if (update.value) {
              data.value = genData(100)
            }
          },
          { flush: 'post' },
        )

        function onClick() {
          update.value = true
          listRef.value.scrollTo({ key: '30', align: 'top' })
        }

        return () => h('div', [h('button', { onClick }), genList(data, listRef)])
      },
    })

    const wrapper = mount(Demo, { attachTo: document.body })
    await nextTick()

    await wrapper.find('button').trigger('click')
    await nextTick()

    const holderEl = wrapper.find('.vc-virtual-list-holder').element as HTMLUListElement
    expect(holderEl.scrollTop).toBe(600)

    wrapper.unmount()
  })

  it('keeps current position when key is never found', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mount(VirtualList, {
      attachTo: document.body,
      props: {
        component: 'ul',
        data: genData(100),
        height: 100,
        itemHeight: 20,
        itemKey: 'id',
      },
      slots: {
        default: ({ item }: any) => h('li', item.id),
      },
    })

    await nextTick()

    const holderEl = wrapper.find('.vc-virtual-list-holder').element as HTMLUListElement

    ;(wrapper.vm as any).scrollTo({ index: 10, align: 'top' })
    await nextTick()
    expect(holderEl.scrollTop).toBe(200)

    // Not exist key should not reset the scroll position
    ;(wrapper.vm as any).scrollTo({ key: 'not-exist', align: 'top' })
    await nextTick()
    expect(holderEl.scrollTop).toBe(200)

    errorSpy.mockRestore()
    wrapper.unmount()
  })
})

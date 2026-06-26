// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { TableContextKey } from '../src/context/TableContext'
import StickyScrollBar from '../src/stickyScrollBar'

function setElementSize(element: HTMLElement, size: Partial<Pick<HTMLElement, 'clientHeight' | 'clientWidth' | 'offsetHeight' | 'scrollWidth'>>) {
  Object.entries(size).forEach(([key, value]) => {
    Object.defineProperty(element, key, {
      configurable: true,
      value,
    })
  })
}

async function waitForRaf() {
  await new Promise(resolve => setTimeout(resolve, 20))
  await new Promise(resolve => setTimeout(resolve, 20))
  await nextTick()
}

describe('table sticky scrollbar', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updates when the table body size changes after mount', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => window.setTimeout(callback, 0))
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(handle => window.clearTimeout(handle))

    const scrollBodyRef = ref<HTMLDivElement | null>(null)
    const container = document.createElement('div')
    setElementSize(container, { clientHeight: 100 })
    container.getBoundingClientRect = () => ({ top: 100, left: 0, right: 200, bottom: 200, width: 200, height: 100 } as DOMRect)

    const body = document.createElement('div')
    setElementSize(body, {
      clientWidth: 0,
      scrollWidth: 0,
      offsetHeight: 300,
    })
    body.getBoundingClientRect = () => ({ top: 0, left: 0, right: 200, bottom: 300, width: 200, height: 300 } as DOMRect)
    document.body.appendChild(container)
    container.appendChild(body)
    scrollBodyRef.value = body

    const wrapper = mount(defineComponent({
      provide: {
        [TableContextKey as symbol]: { prefixCls: 'vc-table' },
      },
      setup() {
        return () => h(StickyScrollBar, {
          scrollBodyRef,
          container,
          direction: 'ltr',
          offsetScroll: 0,
          onScroll: vi.fn(),
        })
      },
    }), { attachTo: document.body })

    await waitForRaf()
    expect(wrapper.find('.vc-table-sticky-scroll').exists()).toBe(false)

    setElementSize(body, {
      clientWidth: 200,
      scrollWidth: 400,
      offsetHeight: 300,
    })
    window.dispatchEvent(new Event('resize'))

    await waitForRaf()

    expect(wrapper.find('.vc-table-sticky-scroll').attributes('style')).toContain('width: 200px')
    expect(wrapper.find('.vc-table-sticky-scroll-bar').attributes('style')).toContain('width: 100px')

    wrapper.unmount()
    container.remove()
  })
})

// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Table, { VirtualTable } from '../src'

const { virtualListScrollTo } = vi.hoisted(() => ({
  virtualListScrollTo: vi.fn(),
}))

vi.mock('@v-c/virtual-list', async () => {
  const { defineComponent, h } = await import('vue')

  return {
    default: defineComponent({
      name: 'VirtualList',
      inheritAttrs: false,
      props: ['data'] as any,
      setup(props, { slots, expose }) {
        expose({
          scrollTo: virtualListScrollTo,
          getScrollInfo: () => ({ x: 0, y: 0 }),
          nativeElement: document.createElement('div'),
        })

        return () =>
          h('div', { class: 'mock-virtual-list' }, (props.data || []).map((item: any, index: number) =>
            slots.default?.({ item, index, style: {} }),
          ))
      },
    }),
  }
})

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
]

const data = [
  { key: 'light', name: 'light' },
  { key: 'bamboo', name: 'bamboo' },
  ...Array.from({ length: 118 }, (_, index) => ({
    key: `${index + 2}`,
    name: `row-${index + 2}`,
  })),
]

let scrollParam: any = null
let scrollIntoViewArgs: any[] = []
let scrollIntoViewElement: HTMLElement | null = null
let originalGetComputedStyle: typeof window.getComputedStyle

function findScrollContainer(element: HTMLElement | null) {
  let current = element?.parentElement || null
  while (current) {
    const className = typeof current.className === 'string' ? current.className : ''
    if (
      className.includes('vc-table-body')
      || className.includes('vc-table-content')
      || className.includes('vc-virtual-list-holder')
    ) {
      return current
    }
    current = current.parentElement
  }
  return null
}

describe('table refs', () => {
  beforeEach(() => {
    scrollParam = null
    scrollIntoViewArgs = []
    scrollIntoViewElement = null
    virtualListScrollTo.mockReset()
    originalGetComputedStyle = window.getComputedStyle.bind(window)

    Object.defineProperty(window, 'getComputedStyle', {
      configurable: true,
      writable: true,
      value(element: Element) {
        return originalGetComputedStyle(element)
      },
    })

    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      writable: true,
      value(param: any) {
        scrollParam = param
        if (param && typeof param === 'object' && 'top' in param && typeof param.top === 'number') {
          this.scrollTop = param.top
        }
      },
    })

    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value(arg?: any) {
        scrollIntoViewElement = this
        scrollIntoViewArgs.push(arg)
        const scrollContainer = findScrollContainer(this)
        if (scrollContainer) {
          scrollContainer.scrollTop = 0
        }
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('supports scrollTo align on regular table', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        data,
        columns,
        scroll: { y: 100 },
      },
    })

    await nextTick()

    ;(wrapper.vm as any).scrollTo({ index: 0, align: 'start' })
    expect(scrollIntoViewElement?.textContent).toContain('light')
    expect(scrollIntoViewArgs.at(-1)).toEqual({ block: 'start' })

    ;(wrapper.vm as any).scrollTo({ key: 'bamboo', align: 'end' })
    expect(scrollIntoViewElement?.textContent).toContain('bamboo')
    expect(scrollIntoViewArgs.at(-1)).toEqual({ block: 'end' })

    ;(wrapper.vm as any).scrollTo({ index: 1, align: 'center', offset: 30 })
    expect(scrollIntoViewArgs.at(-1)).toEqual({ block: 'center' })
    expect(scrollParam).toEqual({ top: 30 })

    ;(wrapper.vm as any).scrollTo({ top: 50 })
    expect(scrollParam).toEqual({ top: 50 })

    ;(wrapper.vm as any).scrollTo({ index: 0, align: 'nearest', offset: -10 })
    expect(scrollIntoViewArgs.at(-1)).toEqual({ block: 'nearest' })
    expect(scrollParam).toEqual({ top: -10 })

    wrapper.unmount()
  })

  it('supports scrollTo align on virtual table', async () => {
    const wrapper = mount(VirtualTable, {
      attachTo: document.body,
      props: {
        data,
        columns,
        scroll: { x: 300, y: 120 },
      },
    })

    await nextTick()

    ;(wrapper.vm as any).scrollTo({ index: 99 })
    expect(virtualListScrollTo).toHaveBeenLastCalledWith({ index: 99, align: 'auto' })

    ;(wrapper.vm as any).scrollTo({ index: 50, offset: 20 })
    expect(virtualListScrollTo).toHaveBeenLastCalledWith({ index: 50, offset: 20, align: 'top' })

    ;(wrapper.vm as any).scrollTo({ index: 50, align: 'end' })
    expect(virtualListScrollTo).toHaveBeenLastCalledWith({ index: 50, align: 'bottom' })

    ;(wrapper.vm as any).scrollTo({ index: 50, align: 'nearest' })
    expect(virtualListScrollTo).toHaveBeenLastCalledWith({ index: 50, align: 'auto' })

    ;(wrapper.vm as any).scrollTo({ index: 50, offset: 20, align: 'end' })
    expect(virtualListScrollTo).toHaveBeenLastCalledWith({ index: 50, offset: 20, align: 'bottom' })

    wrapper.unmount()
  })
})

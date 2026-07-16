// @vitest-environment jsdom

import { _rs } from '@v-c/resize-observer'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Table, { INTERNAL_HOOKS } from '../src'

async function flushResize() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

function mockElementWidth(element: HTMLElement, width: number) {
  Object.defineProperty(element, 'offsetWidth', {
    configurable: true,
    get: () => width,
  })
  element.getBoundingClientRect = () =>
    ({
      width,
      height: 100,
      top: 0,
      left: 0,
      right: width,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect
}

describe('empty state with horizontal scroll', () => {
  it('keeps the empty content inside the measured sticky viewport', async () => {
    const wrapper = mount(Table, {
      attachTo: document.body,
      props: {
        columns: [
          { title: 'Name', dataIndex: 'name', width: 200, fixed: 'start' },
          { title: 'Column 1', dataIndex: 'column1', width: 200 },
          { title: 'Column 2', dataIndex: 'column2', width: 200 },
          { title: 'Action', dataIndex: 'action', width: 200, fixed: 'end' },
        ],
        data: [],
        emptyText: 'No data',
        scroll: { x: 800 },
        internalHooks: INTERNAL_HOOKS,
        tailor: true,
      },
    })

    await flushResize()

    const root = wrapper.get('.vc-table').element as HTMLElement
    mockElementWidth(root, 320)
    _rs?.([{ target: root } as ResizeObserverEntry])
    await flushResize()

    const fixedEmpty = wrapper.get('.vc-table-expanded-row-fixed')
    expect(fixedEmpty.text()).toBe('No data')
    expect(fixedEmpty.attributes('style')).toContain('width: 320px')
    expect(fixedEmpty.attributes('style')).toContain('position: sticky')
    expect(fixedEmpty.attributes('style')).toContain('left: 0px')

    mockElementWidth(root, 480)
    _rs?.([{ target: root } as ResizeObserverEntry])
    await flushResize()

    expect(fixedEmpty.attributes('style')).toContain('width: 480px')

    wrapper.unmount()
  })
})

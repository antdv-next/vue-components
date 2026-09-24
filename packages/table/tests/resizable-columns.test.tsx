// @vitest-environment jsdom

import type { VueWrapper } from '@vue/test-utils'
import ResizeObserver from '@v-c/resize-observer'
import { resetWarned } from '@v-c/util/dist/warning'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Table, { VirtualTable } from '../src'

vi.mock('@v-c/virtual-list', async () => {
  const { defineComponent, h } = await import('vue')
  return {
    default: defineComponent({
      name: 'VirtualList',
      inheritAttrs: false,
      props: ['data'] as any,
      setup(props, { slots, expose }) {
        const nativeElement = document.createElement('div')
        expose({
          scrollTo: vi.fn(),
          getScrollInfo: () => ({ x: 0, y: 0 }),
          nativeElement,
        })
        return () =>
          h('div', { class: 'mock-virtual-list' }, (props.data || []).map((item: any, index: number) =>
            slots.default?.({ item, index, style: {} })))
      },
    }),
  }
})

const data = [
  { key: '1', name: 'Bamboo', age: 32 },
  { key: '2', name: 'Light', age: 28 },
]

function mockRect(element: Element, rect: Partial<DOMRect>) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect)
}

function prepareRects(wrapper: VueWrapper<any>, headerIndex = 0, width = 200) {
  mockRect(wrapper.find('.vc-table').element, { left: 0, top: 0, right: 600, bottom: 300, width: 600, height: 300 })
  const header = wrapper.findAll('thead th')[headerIndex]!.element as HTMLElement
  const left = headerIndex * width
  mockRect(header, { left, top: 0, right: left + width, bottom: 40, width, height: 40 })
  return header
}

function colWidths(wrapper: VueWrapper<any>) {
  return wrapper.findAll('col').map(col => col.attributes('style'))
}

async function drag(wrapper: VueWrapper<any>, handle: ReturnType<VueWrapper<any>['find']>, from: number, to: number) {
  await handle.trigger('mousedown', { button: 0, clientX: from })
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: to, bubbles: true }))
  document.dispatchEvent(new MouseEvent('mouseup', { clientX: to, bubbles: true }))
  await nextTick()
}

function mountTable(columns: any[], props: Record<string, any> = {}) {
  return mount(Table, {
    props: { columns, data, tableLayout: 'fixed', ...props } as any,
    attachTo: document.body,
  })
}

const nativeGetComputedStyle = window.getComputedStyle.bind(window)
const nativeOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')!

/** Make the body container report the width the table fills. */
function mockFillWidth(wrapper: VueWrapper<any>, width: number) {
  Object.defineProperty(wrapper.find('.vc-table-content').element, 'clientWidth', { configurable: true, value: width })
}

/** Make the measure row report `width` for each leaf, as a stretched table would. */
function mockMeasuredWidth(width: number) {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      return this.tagName === 'TD' && this.closest('.vc-table-measure-row') ? width : 0
    },
  })
}

describe('table resizable columns', () => {
  beforeEach(() => {
    // jsdom has no pseudo-element support; the scrollbar probe asks for `::-webkit-scrollbar`.
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element: Element, pseudo?: string | null) =>
      pseudo ? ({ width: '', height: '' } as CSSStyleDeclaration) : nativeGetComputedStyle(element))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', nativeOffsetWidth)
    document.body.style.cssText = ''
    document.body.innerHTML = ''
  })

  it('enables horizontal scroll and a fixed layout for resizable columns', () => {
    const wrapper = mountTable([
      { title: 'Name', dataIndex: 'name', width: 200, resizable: true },
      { title: 'Age', dataIndex: 'age' },
    ], { tableLayout: undefined })

    expect(wrapper.find('.vc-table').classes()).toContain('vc-table-scroll-horizontal')
    expect(wrapper.find('.vc-table-content').attributes('style')).toContain('overflow-x: auto')
    expect(wrapper.find('table').attributes('style')).toContain('table-layout: fixed')
    expect(wrapper.find('.vc-table-measure-row').exists()).toBe(true)
    wrapper.unmount()
  })

  it('pins siblings to their rendered width when widening a stretched table', async () => {
    mockMeasuredWidth(300)
    const onResizeColumn = vi.fn()
    const wrapper = mountTable([
      { title: 'Name', dataIndex: 'name', width: 150, resizable: true },
      { title: 'Age', dataIndex: 'age', width: 80 },
    ], { onResizeColumn })
    mockFillWidth(wrapper, 600)
    prepareRects(wrapper, 0, 300)

    // Nothing is pinned until a drag is committed.
    expect(colWidths(wrapper)).toEqual(['width: 150px;', 'width: 80px;'])

    await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 298, 348)

    // The dragged column gets the drop width and the sibling keeps the
    // stretched width it was rendered at, so nothing is stretched again.
    expect(colWidths(wrapper)).toEqual(['width: 350px;', 'width: 300px;'])
    expect(onResizeColumn).toHaveBeenCalledTimes(1)
    expect(onResizeColumn).toHaveBeenCalledWith(350, expect.objectContaining({ dataIndex: 'name' }), 'key-0')
    wrapper.unmount()
  })

  it('hands the room freed below the fill width to the siblings', async () => {
    mockMeasuredWidth(300)
    const wrapper = mountTable([
      { title: 'Name', dataIndex: 'name', width: 100, resizable: true },
      { title: 'Age', dataIndex: 'age', width: 100 },
      { title: 'Email', dataIndex: 'email', width: 100 },
    ])
    mockFillWidth(wrapper, 900)
    prepareRects(wrapper, 0, 300)

    await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 298, 238)

    // 240 + 330 + 330 fills the 900px table exactly, so the browser has no
    // slack left to spread over the dragged column.
    expect(colWidths(wrapper)).toEqual(['width: 240px;', 'width: 330px;', 'width: 330px;'])
    wrapper.unmount()
  })

  it('pins nothing when a column without width absorbs the slack', async () => {
    mockMeasuredWidth(300)
    const wrapper = mountTable([
      { title: 'Name', dataIndex: 'name', width: 150, resizable: true },
      { title: 'Age', dataIndex: 'age', width: 80 },
      { title: 'Email', dataIndex: 'email' },
    ])
    mockFillWidth(wrapper, 900)
    prepareRects(wrapper, 0, 300)

    await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 298, 238)

    // A trailing column without width renders no `col` and keeps flexing.
    expect(colWidths(wrapper)).toEqual(['width: 240px;', 'width: 80px;'])
    wrapper.unmount()
  })

  describe('columns without width', () => {
    const columns = [
      { title: 'Name', dataIndex: 'name', width: 150, resizable: true },
      { title: 'Age', dataIndex: 'age', width: 80 },
      { title: 'Email', dataIndex: 'email' },
    ]
    const tableWidths = (wrapper: VueWrapper<any>) =>
      wrapper.findAll('table').map(table => (table.element as HTMLElement).style.width)

    it('keep their width and grow the table instead of being squeezed', async () => {
      mockMeasuredWidth(300)
      const wrapper = mountTable(columns)
      mockFillWidth(wrapper, 600)
      prepareRects(wrapper, 0, 300)

      await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 298, 598)

      // 600 + 80 + the 300 the Email column was rendered at before the drag.
      expect(colWidths(wrapper)).toEqual(['width: 600px;', 'width: 80px;'])
      expect(tableWidths(wrapper)).toEqual(['980px'])
      wrapper.unmount()
    })

    it('apply the table width to a fixed header as well', async () => {
      mockMeasuredWidth(300)
      const wrapper = mountTable(columns, { scroll: { y: 100 } })
      prepareRects(wrapper, 0, 300)

      await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 298, 598)

      expect(tableWidths(wrapper)).toEqual(['980px', '980px'])
      wrapper.unmount()
    })

    it('keep a larger `scroll.x` and honor `minWidth` as the floor', async () => {
      mockMeasuredWidth(300)
      const wrapper = mountTable([
        columns[0],
        columns[1],
        { ...columns[2], minWidth: 400 },
      ], { scroll: { x: 2000 } })
      mockFillWidth(wrapper, 600)
      prepareRects(wrapper, 0, 300)

      await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 298, 598)
      expect(tableWidths(wrapper)).toEqual(['2000px'])

      await wrapper.setProps({ scroll: { x: 800 } })
      expect(tableWidths(wrapper)).toEqual(['1080px'])
      wrapper.unmount()
    })

    it('drop their floors when the set of columns changes', async () => {
      mockMeasuredWidth(300)
      const wrapper = mountTable(columns)
      mockFillWidth(wrapper, 600)
      prepareRects(wrapper, 0, 300)

      await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 298, 598)
      expect(tableWidths(wrapper)).toEqual(['980px'])

      await wrapper.setProps({ columns: [...columns, { title: 'Extra', key: 'extra' }] })
      expect(tableWidths(wrapper)).toEqual([''])
      wrapper.unmount()
    })
  })

  it('keeps pins through the controlled echo and releases them on an outside change', async () => {
    mockMeasuredWidth(300)
    const initial = [
      { title: 'Name', dataIndex: 'name', width: 150, resizable: true },
      { title: 'Age', dataIndex: 'age', width: 80, resizable: true },
    ]
    const wrapper = mountTable(initial, {
      onResizeColumn: (width: number, column: any) => {
        wrapper.setProps({ columns: initial.map(col => col.dataIndex === column.dataIndex ? { ...col, width } : col) })
      },
    })
    mockFillWidth(wrapper, 600)
    prepareRects(wrapper, 0, 300)

    await drag(wrapper, wrapper.findAll('.vc-table-resize-handle')[0]!, 298, 348)
    await nextTick()
    expect(colWidths(wrapper)).toEqual(['width: 350px;', 'width: 300px;'])

    // A reset from outside restores the configured layout.
    await wrapper.setProps({ columns: initial })
    expect(colWidths(wrapper)).toEqual(['width: 150px;', 'width: 80px;'])
    wrapper.unmount()
  })

  it('releases pins when the table is resized', async () => {
    mockMeasuredWidth(300)
    const wrapper = mountTable([
      { title: 'Name', dataIndex: 'name', width: 150, resizable: true },
      { title: 'Age', dataIndex: 'age', width: 80 },
    ])
    mockFillWidth(wrapper, 600)
    prepareRects(wrapper, 0, 300)

    await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 298, 348)
    expect(colWidths(wrapper)).toEqual(['width: 350px;', 'width: 300px;'])

    // The pinned sibling was fitted to the old fill width; the dragged width stays.
    wrapper.findComponent(ResizeObserver).props('onResize')!({ offsetWidth: 500 } as any, document.body)
    await nextTick()
    expect(colWidths(wrapper)).toEqual(['width: 350px;', 'width: 80px;'])
    wrapper.unmount()
  })

  it('releases pins when the set of columns changes', async () => {
    mockMeasuredWidth(300)
    const columns = [
      { title: 'Name', dataIndex: 'name', width: 150, resizable: true },
      { title: 'Age', dataIndex: 'age', width: 80 },
    ]
    const wrapper = mountTable(columns)
    mockFillWidth(wrapper, 600)
    prepareRects(wrapper, 0, 300)

    await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 298, 348)
    expect(colWidths(wrapper)).toEqual(['width: 350px;', 'width: 300px;'])

    await wrapper.setProps({ columns: [...columns, { title: 'Email', dataIndex: 'email', width: 100 }] })
    expect(colWidths(wrapper)).toEqual(['width: 350px;', 'width: 80px;', 'width: 100px;'])
    wrapper.unmount()
  })

  it('does not commit a sub-pixel start width when the drag returns to its origin', async () => {
    const onResizeColumn = vi.fn()
    const wrapper = mountTable([
      { title: 'Name', dataIndex: 'name', width: 200, resizable: true },
      { title: 'Age', dataIndex: 'age', width: 200 },
    ], { onResizeColumn })
    mockRect(wrapper.find('.vc-table').element, { left: 0, top: 0, right: 600, bottom: 300, width: 600, height: 300 })
    mockRect(wrapper.find('thead th').element, { left: 0, top: 0, right: 200.4, bottom: 40, width: 200.4, height: 40 })
    const handle = wrapper.find('.vc-table-resize-handle')

    await handle.trigger('mousedown', { button: 0, clientX: 198 })
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 248 }))
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 198 }))
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 198 }))
    await nextTick()

    expect(colWidths(wrapper)).toEqual(['width: 200px;', 'width: 200px;'])
    expect(onResizeColumn).not.toHaveBeenCalled()

    await drag(wrapper, handle, 198, 228)
    expect(colWidths(wrapper)[0]).toBe('width: 230px;')
    expect(onResizeColumn).toHaveBeenCalledWith(230, expect.objectContaining({ dataIndex: 'name' }), 'key-0')
    wrapper.unmount()
  })

  it('passes the column key to tell apart leaves sharing a dataIndex', async () => {
    const onResizeColumn = vi.fn()
    const wrapper = mountTable([
      { title: 'A', children: [{ title: 'Name', dataIndex: 'name', width: 200, resizable: true }] },
      { title: 'B', children: [{ title: 'Name', dataIndex: 'name', width: 200, resizable: true }] },
    ], { onResizeColumn })
    const leaves = wrapper.findAll('thead tr')[1]!.findAll('th')
    prepareRects(wrapper, 3)

    await drag(wrapper, leaves[1]!.find('.vc-table-resize-handle'), 598, 648)

    expect(onResizeColumn).toHaveBeenCalledWith(250, expect.objectContaining({ dataIndex: 'name' }), 'key-1-0')
    expect(colWidths(wrapper)).toEqual(['width: 200px;', 'width: 250px;'])
    wrapper.unmount()
  })

  describe('layout warning', () => {
    const layoutWarning = expect.stringContaining('`resizable` columns need `tableLayout: \'fixed\'`')

    beforeEach(() => {
      resetWarned()
    })

    it('warns when `tableLayout` is explicitly auto', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = mountTable([{ title: 'Name', dataIndex: 'name', width: 200, resizable: true }], { tableLayout: 'auto' })
      expect(errorSpy).toHaveBeenCalledWith(layoutWarning)
      wrapper.unmount()
    })

    it('warns for `scroll.x: max-content` with fixed columns', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = mountTable([
        { title: 'Name', dataIndex: 'name', width: 200, fixed: 'start', resizable: true },
        { title: 'Age', dataIndex: 'age', width: 200 },
      ], { tableLayout: undefined, scroll: { x: 'max-content' } })
      expect(errorSpy).toHaveBeenCalledWith(layoutWarning)
      wrapper.unmount()
    })

    it('stays quiet for the default layout and for auto tables without resizable columns', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const resizable = mountTable([{ title: 'Name', dataIndex: 'name', width: 200, resizable: true }], { tableLayout: undefined })
      const plain = mountTable([{ title: 'Name', dataIndex: 'name', width: 200 }], { tableLayout: 'auto' })
      expect(errorSpy).not.toHaveBeenCalledWith(layoutWarning)
      resizable.unmount()
      plain.unmount()
    })
  })

  it('renders a handle only on resizable leaf cells and no proxy without any', () => {
    const plain = mountTable([{ title: 'Name', dataIndex: 'name', width: 200 }])
    expect(plain.find('.vc-table-resize-handle').exists()).toBe(false)
    expect(plain.find('.vc-table-resize-proxy').exists()).toBe(false)
    // No `<!---->` placeholder either, so consumer DOM snapshots are unchanged.
    expect(plain.find('.vc-table').element.lastChild?.nodeType).not.toBe(Node.COMMENT_NODE)
    plain.unmount()

    const wrapper = mountTable([
      { title: 'Name', dataIndex: 'name', width: 200, resizable: true },
      { title: 'Age', dataIndex: 'age', width: 200 },
    ])
    const headers = wrapper.findAll('thead th')
    expect(headers[0]!.find('.vc-table-resize-handle').exists()).toBe(true)
    expect(headers[1]!.find('.vc-table-resize-handle').exists()).toBe(false)
    expect(wrapper.find('.vc-table-resize-proxy').exists()).toBe(true)
    expect(wrapper.find('.vc-table-resize-proxy').attributes('style')).toContain('display: none')
    wrapper.unmount()
  })

  it('moves only the proxy while dragging and commits the width on mouseup', async () => {
    const onResizeColumn = vi.fn()
    const columns = [
      { title: 'Name', dataIndex: 'name', width: 200, resizable: true },
      { title: 'Age', dataIndex: 'age', width: 200 },
    ]
    const wrapper = mountTable(columns, { onResizeColumn })
    prepareRects(wrapper)
    const handle = wrapper.find('.vc-table-resize-handle')

    await handle.trigger('mousedown', { button: 0, clientX: 198 })
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 228 }))
    await nextTick()

    const proxy = wrapper.find('.vc-table-resize-proxy').element as HTMLElement
    expect(proxy.style.display).toBe('block')
    expect(proxy.style.left).toBe('200px')
    expect(proxy.style.transform).toBe('translateX(30px)')
    expect(document.body.style.userSelect).toBe('none')
    expect(document.body.style.cursor).toBe('col-resize')
    expect(colWidths(wrapper)).toEqual(['width: 200px;', 'width: 200px;'])

    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 228 }))
    await nextTick()

    expect(proxy.style.display).toBe('none')
    expect(document.body.style.userSelect).toBe('')
    expect(document.body.style.cursor).toBe('')
    expect(colWidths(wrapper)).toEqual(['width: 230px;', 'width: 200px;'])
    expect(onResizeColumn).toHaveBeenCalledTimes(1)
    expect(onResizeColumn).toHaveBeenCalledWith(230, expect.objectContaining({ dataIndex: 'name', resizable: true }), 'key-0')
    wrapper.unmount()
  })

  it('treats movement below the threshold as a click', async () => {
    const onResizeColumn = vi.fn()
    const wrapper = mountTable([{ title: 'Name', dataIndex: 'name', width: 200, resizable: true }], { onResizeColumn })
    prepareRects(wrapper)

    await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 198, 200)

    expect(wrapper.find('.vc-table-resize-proxy').attributes('style')).toContain('display: none')
    expect(colWidths(wrapper)).toEqual(['width: 200px;'])
    expect(onResizeColumn).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('ignores non-primary buttons', async () => {
    const onResizeColumn = vi.fn()
    const wrapper = mountTable([{ title: 'Name', dataIndex: 'name', width: 200, resizable: true }], { onResizeColumn })
    prepareRects(wrapper)

    await wrapper.find('.vc-table-resize-handle').trigger('mousedown', { button: 2, clientX: 198 })
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 250 }))
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 250 }))
    await nextTick()

    expect(colWidths(wrapper)).toEqual(['width: 200px;'])
    expect(onResizeColumn).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('clamps to `minWidth` and falls back to the default minimum', async () => {
    const wrapper = mountTable([
      { title: 'Name', dataIndex: 'name', width: 200, resizable: true, minWidth: 120 },
      { title: 'Age', dataIndex: 'age', width: 200, resizable: true },
    ])
    prepareRects(wrapper, 0)
    prepareRects(wrapper, 1)
    const handles = wrapper.findAll('.vc-table-resize-handle')

    await drag(wrapper, handles[0]!, 198, 0)
    expect(colWidths(wrapper)[0]).toBe('width: 120px;')

    await drag(wrapper, handles[1]!, 398, 0)
    expect(colWidths(wrapper)[1]).toBe('width: 40px;')
    wrapper.unmount()
  })

  it('uses the rendered width when the column has no configured width', async () => {
    const onResizeColumn = vi.fn()
    const wrapper = mountTable([{ title: 'Name', dataIndex: 'name', resizable: true }], { onResizeColumn })
    prepareRects(wrapper, 0, 300)

    await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 298, 318)

    expect(colWidths(wrapper)).toEqual(['width: 320px;'])
    expect(onResizeColumn).toHaveBeenCalledWith(320, expect.objectContaining({ dataIndex: 'name' }), 'key-0')
    wrapper.unmount()
  })

  it('reverses the drag direction in RTL', async () => {
    const wrapper = mountTable([{ title: 'Name', dataIndex: 'name', width: 200, resizable: true }], { direction: 'rtl' })
    prepareRects(wrapper)

    await wrapper.find('.vc-table-resize-handle').trigger('mousedown', { button: 0, clientX: 2 })
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: -28 }))
    await nextTick()
    const proxy = wrapper.find('.vc-table-resize-proxy').element as HTMLElement
    expect(proxy.style.left).toBe('0px')
    expect(proxy.style.transform).toBe('translateX(-30px)')

    document.dispatchEvent(new MouseEvent('mouseup', { clientX: -28 }))
    await nextTick()
    expect(colWidths(wrapper)).toEqual(['width: 230px;'])
    wrapper.unmount()
  })

  it('resizes leaves under a group header and never the group itself', async () => {
    const onResizeColumn = vi.fn()
    const wrapper = mountTable([
      {
        title: 'Person',
        children: [
          { title: 'Name', dataIndex: 'name', width: 200, resizable: true },
          { title: 'Age', dataIndex: 'age', width: 200, resizable: true },
        ],
      },
      { title: 'Extra', key: 'extra', width: 100 },
    ], { onResizeColumn })

    const headers = wrapper.findAll('thead th')
    // Row 0: group + rowSpan leaf; row 1: the two grouped leaves.
    expect(headers[0]!.attributes('colspan')).toBe('2')
    expect(headers[0]!.find('.vc-table-resize-handle').exists()).toBe(false)
    expect(headers[1]!.find('.vc-table-resize-handle').exists()).toBe(false)
    expect(headers[2]!.find('.vc-table-resize-handle').exists()).toBe(true)
    expect(headers[3]!.find('.vc-table-resize-handle').exists()).toBe(true)

    prepareRects(wrapper, 3)
    await drag(wrapper, headers[3]!.find('.vc-table-resize-handle'), 798, 748)

    expect(colWidths(wrapper)).toEqual(['width: 200px;', 'width: 150px;', 'width: 100px;'])
    expect(onResizeColumn).toHaveBeenCalledWith(150, expect.objectContaining({ dataIndex: 'age' }), 'key-0-1')
    wrapper.unmount()
  })

  it.each(['column', 'onHeaderCell'] as const)('skips a merged header configured through %s', (source) => {
    const wrapper = mountTable([
      {
        title: 'Name',
        dataIndex: 'name',
        width: 200,
        resizable: true,
        ...(source === 'column' ? { colSpan: 2 } : { onHeaderCell: () => ({ colSpan: 2 }) }),
      },
      { title: 'Age', dataIndex: 'age', width: 200, colSpan: 0, resizable: true },
    ])

    const header = wrapper.find('thead th')
    expect(header.attributes('colspan')).toBe('2')
    expect(wrapper.find('.vc-table-resize-handle').exists()).toBe(false)
    wrapper.unmount()
  })

  it('keeps widths isolated for duplicate dataIndex across groups', async () => {
    const wrapper = mountTable([
      { title: 'A', children: [{ title: 'Name', dataIndex: 'name', width: 200, resizable: true }] },
      { title: 'B', children: [{ title: 'Name', dataIndex: 'name', width: 200, resizable: true }] },
    ])
    const leaves = wrapper.findAll('thead tr')[1]!.findAll('th')
    prepareRects(wrapper, 2)

    await drag(wrapper, leaves[0]!.find('.vc-table-resize-handle'), 198, 248)

    expect(colWidths(wrapper)).toEqual(['width: 250px;', 'width: 200px;'])
    wrapper.unmount()
  })

  it('drops the internal width once the source width changes', async () => {
    const columns = [
      { title: 'Name', dataIndex: 'name', width: 200, resizable: true },
      { title: 'Age', dataIndex: 'age', width: 200 },
    ]
    const wrapper = mountTable(columns)
    prepareRects(wrapper)

    await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 198, 248)
    expect(colWidths(wrapper)[0]).toBe('width: 250px;')

    // Unrelated column change keeps the resized width.
    await wrapper.setProps({ columns: [columns[0], { ...columns[1], width: 300 }] })
    expect(colWidths(wrapper)).toEqual(['width: 250px;', 'width: 300px;'])

    // Changing the resized column's own width takes over.
    await wrapper.setProps({ columns: [{ ...columns[0], width: 120 }, columns[1]] })
    expect(colWidths(wrapper)[0]).toBe('width: 120px;')

    // Returning to the width the drag was committed against does not revive it.
    await wrapper.setProps({ columns })
    expect(colWidths(wrapper)[0]).toBe('width: 200px;')
    wrapper.unmount()
  })

  it('cancels on window blur without committing and allows another drag', async () => {
    const onResizeColumn = vi.fn()
    const wrapper = mountTable([{ title: 'Name', dataIndex: 'name', width: 200, resizable: true }], { onResizeColumn })
    prepareRects(wrapper)
    const handle = wrapper.find('.vc-table-resize-handle')

    await handle.trigger('mousedown', { button: 0, clientX: 198 })
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 248 }))
    window.dispatchEvent(new Event('blur'))
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 248 }))
    await nextTick()

    expect(wrapper.find('.vc-table-resize-proxy').attributes('style')).toContain('display: none')
    expect(document.body.style.userSelect).toBe('')
    expect(colWidths(wrapper)).toEqual(['width: 200px;'])
    expect(onResizeColumn).not.toHaveBeenCalled()

    await drag(wrapper, handle, 198, 218)
    expect(colWidths(wrapper)).toEqual(['width: 220px;'])
    expect(onResizeColumn).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('swallows the click produced by a drag but not a regular header click', async () => {
    const onClick = vi.fn()
    const onMousedown = vi.fn()
    const wrapper = mountTable([{
      title: 'Name',
      dataIndex: 'name',
      width: 200,
      resizable: true,
      onHeaderCell: () => ({ onClick, onMousedown }),
    }])
    const header = prepareRects(wrapper)
    const handle = wrapper.find('.vc-table-resize-handle')

    // Press and click on the handle never reach the header cell.
    await handle.trigger('mousedown', { button: 0, clientX: 198 })
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 198 }))
    await handle.trigger('click')
    expect(onMousedown).not.toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()

    // A drag ending in the same cell fires a click on it; suppress just that one.
    await drag(wrapper, handle, 198, 228)
    header.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onClick).not.toHaveBeenCalled()

    header.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onClick).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('clears the click guard when no click follows the drag', async () => {
    vi.useFakeTimers()
    const onClick = vi.fn()
    const wrapper = mountTable([{
      title: 'Name',
      dataIndex: 'name',
      width: 200,
      resizable: true,
      onHeaderCell: () => ({ onClick }),
    }])
    const header = prepareRects(wrapper)

    await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 198, 228)
    vi.runAllTimers()
    header.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onClick).toHaveBeenCalledTimes(1)
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('cleans up document listeners and body styles on unmount mid-drag', async () => {
    const onResizeColumn = vi.fn()
    const wrapper = mountTable([{ title: 'Name', dataIndex: 'name', width: 200, resizable: true }], { onResizeColumn })
    prepareRects(wrapper)

    await wrapper.find('.vc-table-resize-handle').trigger('mousedown', { button: 0, clientX: 198 })
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 248 }))
    expect(document.body.style.userSelect).toBe('none')

    wrapper.unmount()
    expect(document.body.style.userSelect).toBe('')

    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 300 }))
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 300 }))
    expect(onResizeColumn).not.toHaveBeenCalled()
  })

  it('works with a sticky header and fixed columns', async () => {
    const onResizeColumn = vi.fn()
    const wrapper = mountTable([
      { title: 'Name', dataIndex: 'name', width: 200, fixed: 'start', resizable: true },
      { title: 'Age', dataIndex: 'age', width: 200, resizable: true },
    ], { scroll: { x: 400, y: 100 }, sticky: true, onResizeColumn })
    prepareRects(wrapper)

    expect(wrapper.find('.vc-table-header .vc-table-resize-handle').exists()).toBe(true)
    await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 198, 248)

    expect(colWidths(wrapper)[0]).toBe('width: 250px;')
    expect(onResizeColumn).toHaveBeenCalledWith(250, expect.objectContaining({ dataIndex: 'name' }), 'key-0')
    wrapper.unmount()
  })

  it('works with VirtualTable', async () => {
    const onResizeColumn = vi.fn()
    const wrapper = mount(VirtualTable, {
      props: {
        columns: [
          { title: 'Name', dataIndex: 'name', width: 200, resizable: true },
          { title: 'Age', dataIndex: 'age', width: 200 },
        ],
        data,
        scroll: { x: 400, y: 100 },
        listItemHeight: 20,
        onResizeColumn,
      } as any,
      attachTo: document.body,
    })
    prepareRects(wrapper)

    expect(wrapper.find('.vc-table-resize-proxy').exists()).toBe(true)
    await drag(wrapper, wrapper.find('.vc-table-resize-handle'), 198, 248)

    expect(colWidths(wrapper)[0]).toBe('width: 250px;')
    expect(onResizeColumn).toHaveBeenCalledWith(250, expect.objectContaining({ dataIndex: 'name' }), 'key-0')
    wrapper.unmount()
  })
})

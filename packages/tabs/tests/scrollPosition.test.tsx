import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Tabs from '../src'

// jsdom 不做布局，容器/列表/tab 的尺寸都靠 ResizeObserver 回调驱动，
// 因此按 virtual-list 的做法 mock 掉 @v-c/resize-observer，手动触发 resize。
const { triggers } = vi.hoisted(() => ({ triggers: [] as Array<() => void> }))

vi.mock('@v-c/resize-observer', async (importOriginal) => {
  const actual = await importOriginal<Record<string, any>>()
  const { defineComponent } = await import('vue')
  return {
    ...actual,
    default: defineComponent({
      name: 'MockResizeObserver',
      emits: ['resize'],
      setup(_props, { emit, slots }) {
        triggers.push(() => emit('resize'))
        return () => slots.default?.()
      },
    }),
  }
})

// 主轴（横向为宽、纵向为高）每个 tab 100，可视区 200，共 6 个 tab。
const TAB_SIZE = 100
const VISIBLE_SIZE = 200
const CROSS_SIZE = 40
const ITEMS = Array.from({ length: 6 }, (_, i) => ({ key: String(i + 1), label: `Tab ${i + 1}` }))

let wrapper: VueWrapper

function stubRect(el: Element, rect: { width: number, height: number, left?: number, top?: number }) {
  const left = rect.left ?? 0
  const top = rect.top ?? 0
  Object.defineProperty(el, 'offsetWidth', { value: rect.width, configurable: true })
  Object.defineProperty(el, 'offsetHeight', { value: rect.height, configurable: true })
  ;(el as any).getBoundingClientRect = () => ({
    x: left,
    y: top,
    left,
    top,
    right: left + rect.width,
    bottom: top + rect.height,
    width: rect.width,
    height: rect.height,
    toJSON: () => ({}),
  })
}

function isVertical(tabPosition?: string) {
  return tabPosition === 'left' || tabPosition === 'right'
}

/**
 * 默认激活第 3 个 tab（主轴偏移 200、尺寸 100）。
 * 横向（top/bottom）按 left/width 布局，纵向（left/right）按 top/height 布局。
 * 返回 nav-list 的 inline style，用于读取 transform。
 */
async function mountTabs(props: Record<string, any> = {}) {
  const vertical = isVertical(props.tabPosition)

  wrapper?.unmount()
  triggers.length = 0

  wrapper = mount(Tabs, {
    props: { items: ITEMS, defaultActiveKey: '3', ...props },
  })

  await wrapper.vm.$nextTick()

  stubRect(
    wrapper.find('[role="tablist"]').element,
    vertical ? { width: CROSS_SIZE, height: VISIBLE_SIZE } : { width: VISIBLE_SIZE, height: CROSS_SIZE },
  )
  stubRect(
    wrapper.find('.vc-tabs-nav-list').element,
    vertical
      ? { width: CROSS_SIZE, height: TAB_SIZE * ITEMS.length }
      : { width: TAB_SIZE * ITEMS.length, height: CROSS_SIZE },
  )
  wrapper.findAll('[data-node-key]').forEach((node, i) => {
    stubRect(
      node.element,
      vertical
        ? { width: CROSS_SIZE, height: TAB_SIZE, top: i * TAB_SIZE }
        : { width: TAB_SIZE, height: CROSS_SIZE, left: i * TAB_SIZE },
    )
  })

  triggers.forEach(trigger => trigger())
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()

  return wrapper.find('.vc-tabs-nav-list').attributes('style') ?? ''
}

function translateX(style: string) {
  const matched = /translate\((-?[\d.]+)px/.exec(style)
  return matched ? Number(matched[1]) : null
}

function translateY(style: string) {
  const matched = /translate\([^,]+,\s*(-?[\d.]+)px/.exec(style)
  return matched ? Number(matched[1]) : null
}

/** 读当前朝向下的对齐偏移。 */
async function align(props: Record<string, any> = {}) {
  const style = await mountTabs(props)
  return isVertical(props.tabPosition) ? translateY(style) : translateX(style)
}

afterEach(() => {
  wrapper?.unmount()
  triggers.length = 0
  vi.restoreAllMocks()
})

// 手算基准：激活项主轴偏移 200、尺寸 100，可视区 200。
//   auto   → -(200 + 100 - 200) = -100
//   start  → -(200 + 100*0   - 200*0)   = -200
//   center → -(200 + 100*0.5 - 200*0.5) = -150
//   end    → -(200 + 100*1   - 200*1)   = -100
// 数值比例会被 clamp 到 [0, 1]；NaN 回落到 auto。
const LAYOUTS: Array<{ position: any, expected: number }> = [
  { position: 'start', expected: -200 },
  { position: 'center', expected: -150 },
  { position: 'end', expected: -100 },
  { position: 0, expected: -200 },
  { position: 0.25, expected: -175 },
  { position: 0.5, expected: -150 },
  { position: 1, expected: -100 },
  { position: 1.5, expected: -100 },
  { position: -0.5, expected: -200 },
  { position: Number.NaN, expected: -100 },
]

describe('tabs scrollPosition', () => {
  // react-component/tabs#1016
  it('keeps the legacy edge alignment when scrollPosition is not set', async () => {
    expect(await align()).toBe(-100)
  })

  // react-component/tabs#1016：横向（top / bottom）分支
  it.each(LAYOUTS)('top: $position', async ({ position, expected }) => {
    expect(await align({ scrollPosition: position })).toBe(expected)
  })

  // react-component/tabs#1016：纵向（left / right）走的是独立分支，必须单独覆盖
  it.each(LAYOUTS)('left: $position', async ({ position, expected }) => {
    expect(await align({ tabPosition: 'left', scrollPosition: position })).toBe(expected)
  })

  // react-component/tabs#1016：NaN 必须回落到默认行为，否则会渲染出 translate(NaNpx)
  it('never renders a NaN transform', async () => {
    const style = await mountTabs({ scrollPosition: Number.NaN })

    expect(style).not.toContain('NaN')
  })

  // react-component/tabs#1016：prop 不能泄漏成根元素的 DOM 属性
  it('does not leak the prop onto the root element', async () => {
    await mountTabs({ scrollPosition: 'center' })

    expect(wrapper.element.hasAttribute('scrollposition')).toBe(false)
  })
})

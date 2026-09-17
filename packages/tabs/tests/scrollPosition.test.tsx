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

const TAB_WIDTH = 100
const VISIBLE_WIDTH = 200
const ITEMS = Array.from({ length: 6 }, (_, i) => ({ key: String(i + 1), label: `Tab ${i + 1}` }))

let wrapper: VueWrapper

function stubSize(el: Element, width: number, height: number, left = 0) {
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true })
  Object.defineProperty(el, 'offsetHeight', { value: height, configurable: true })
  ;(el as any).getBoundingClientRect = () => ({
    x: left,
    y: 0,
    left,
    top: 0,
    right: left + width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  })
}

/**
 * 6 个宽 100 的 tab，可视区 200；默认激活第 3 个（left 200、width 100）。
 * 返回 nav-list 的 inline style，用于读取 transform。
 */
async function mountTabs(props: Record<string, any> = {}) {
  wrapper?.unmount()
  triggers.length = 0

  wrapper = mount(Tabs, {
    props: { items: ITEMS, defaultActiveKey: '3', ...props },
  })

  await wrapper.vm.$nextTick()

  stubSize(wrapper.find('[role="tablist"]').element, VISIBLE_WIDTH, 40)
  stubSize(wrapper.find('.vc-tabs-nav-list').element, TAB_WIDTH * ITEMS.length, 40)
  wrapper.findAll('[data-node-key]').forEach((node, i) => {
    stubSize(node.element, TAB_WIDTH, 40, i * TAB_WIDTH)
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

afterEach(() => {
  wrapper?.unmount()
  triggers.length = 0
  vi.restoreAllMocks()
})

describe('tabs scrollPosition', () => {
  // react-component/tabs#1016
  it('keeps the legacy edge alignment when scrollPosition is not set', async () => {
    expect(translateX(await mountTabs())).toBe(-100)
  })

  // react-component/tabs#1016
  it('aligns the active tab to the start of the viewport', async () => {
    expect(translateX(await mountTabs({ scrollPosition: 'start' }))).toBe(-200)
  })

  // react-component/tabs#1016
  it('aligns the active tab to the center of the viewport', async () => {
    expect(translateX(await mountTabs({ scrollPosition: 'center' }))).toBe(-150)
  })

  // react-component/tabs#1016
  it('aligns the active tab to the end of the viewport', async () => {
    expect(translateX(await mountTabs({ scrollPosition: 'end' }))).toBe(-100)
  })

  // react-component/tabs#1016：数值比例会被 clamp 到 [0, 1]
  it('clamps a numeric ratio into [0, 1]', async () => {
    expect(translateX(await mountTabs({ scrollPosition: 1.5 }))).toBe(-100)
    expect(translateX(await mountTabs({ scrollPosition: -0.5 }))).toBe(-200)
  })

  // react-component/tabs#1016：NaN 必须回落到默认行为，否则会渲染出 translate(NaNpx)
  it('falls back to the legacy alignment for NaN', async () => {
    const style = await mountTabs({ scrollPosition: Number.NaN })

    expect(translateX(style)).toBe(-100)
    expect(style).not.toContain('NaN')
  })

  // react-component/tabs#1016：prop 不能泄漏成根元素的 DOM 属性
  it('does not leak the prop onto the root element', async () => {
    await mountTabs({ scrollPosition: 'center' })

    expect(wrapper.element.hasAttribute('scrollposition')).toBe(false)
  })
})

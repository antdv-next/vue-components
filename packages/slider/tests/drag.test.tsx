// @vitest-environment jsdom

import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Slider from '../src'

const HANDLE_SELECTOR = '[role="slider"]'
const DRAGGING_CLASS = 'vc-slider-handle-dragging'

let wrapper: VueWrapper

/**
 * 拖拽期间的 `mouseup` 监听挂在 `document` 上，所以组件必须真正挂载到 DOM，
 * 事件才能沿着 document → handle 的事件路径派发。
 */
function mountSlider() {
  wrapper = mount(Slider, { props: { defaultValue: 20 }, attachTo: document.body })
  return wrapper
}

/** jsdom 里 `getBoundingClientRect` 一律返回 0，这里给出一个可用的尺寸 */
function stubRect(el: Element, width = 100, height = 10) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect)
}

/** jsdom 的 MouseEvent 不实现 pageX / pageY，需要手动定义 */
function createMouseEvent(type: string, pageX: number, pageY = 0) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'pageX', { value: pageX })
  Object.defineProperty(event, 'pageY', { value: pageY })
  return event
}

/** jsdom 不实现 TouchEvent，用普通 Event 补齐 `useDrag` 读取的字段 */
function createTouchEvent(type: string, pageX: number) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  const touch = { pageX, pageY: 0 }
  Object.defineProperty(event, 'targetTouches', { value: [touch] })
  Object.defineProperty(event, 'touches', { value: [touch] })
  return event
}

afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('slider drag', () => {
  it('finishes the drag when an inner element stops the mouseup propagation', async () => {
    const w = mountSlider()
    stubRect(w.element)

    const handle = w.get(HANDLE_SELECTOR).element
    handle.dispatchEvent(createMouseEvent('mousedown', 0))
    await w.vm.$nextTick()

    expect(w.get(HANDLE_SELECTOR).classes()).toContain(DRAGGING_CLASS)

    document.dispatchEvent(createMouseEvent('mousemove', 60))
    await w.vm.$nextTick()

    // 内层元素把冒泡的 mouseup 拦掉：捕获阶段监听仍须收到，否则滑块会卡在拖拽态
    handle.addEventListener('mouseup', event => event.stopPropagation(), { once: true })
    handle.dispatchEvent(createMouseEvent('mouseup', 60))
    await w.vm.$nextTick()

    expect(w.emitted('changeComplete')).toHaveLength(1)
    expect(w.get(HANDLE_SELECTOR).classes()).not.toContain(DRAGGING_CLASS)
  })

  it('only suppresses the native default action for the touch drag end', async () => {
    const w = mountSlider()
    stubRect(w.element)

    const handle = w.get(HANDLE_SELECTOR).element

    handle.dispatchEvent(createTouchEvent('touchstart', 0))
    await w.vm.$nextTick()

    const touchEnd = createTouchEvent('touchend', 0)
    handle.dispatchEvent(touchEnd)
    expect(touchEnd.defaultPrevented).toBe(true)

    await w.vm.$nextTick()

    // 鼠标拖拽结束时不应阻止默认行为，否则会吞掉页面其它交互
    handle.dispatchEvent(createMouseEvent('mousedown', 0))
    await w.vm.$nextTick()

    const mouseUp = createMouseEvent('mouseup', 0)
    document.dispatchEvent(mouseUp)
    expect(mouseUp.defaultPrevented).toBe(false)
  })

  it('removes its mouseup listener so a second drag is not double counted', async () => {
    const w = mountSlider()
    stubRect(w.element)

    const handle = w.get(HANDLE_SELECTOR).element

    for (let i = 0; i < 2; i += 1) {
      handle.dispatchEvent(createMouseEvent('mousedown', 0))
      await w.vm.$nextTick()

      document.dispatchEvent(createMouseEvent('mouseup', 0))
      await w.vm.$nextTick()
    }

    expect(w.emitted('changeComplete')).toHaveLength(2)
  })
})

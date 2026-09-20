// @vitest-environment jsdom

import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Slider from '../src'

const HANDLE = '[role="slider"]'

let wrapper: VueWrapper

function mountRange(defaultValue: number[]) {
  wrapper = mount(Slider, {
    props: { range: true, min: 0, max: 1, step: 0.1, pushable: 0.1, defaultValue },
  })

  // 容器宽度决定 pageX 到数值的换算：100px 对应 min..max 区间
  vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 100,
    bottom: 20,
    width: 100,
    height: 20,
    toJSON: () => ({}),
  } as DOMRect)

  return wrapper
}

function mouseEvent(type: string, pageX: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0 })
  Object.defineProperty(event, 'pageX', { value: pageX })
  Object.defineProperty(event, 'pageY', { value: 0 })
  return event
}

function dragHandle(index: number, fromPageX: number, toPageX: number) {
  const handle = wrapper.findAll(HANDLE)[index].element
  handle.dispatchEvent(mouseEvent('mousedown', fromPageX))
  document.dispatchEvent(mouseEvent('mousemove', toPageX))
  document.dispatchEvent(mouseEvent('mouseup', toPageX))
}

function lastChange() {
  return wrapper.emitted('change')?.at(-1)?.[0]
}

afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
})

describe('slider decimal pushable', () => {
  // react-component/slider#1091
  it('pushes decimal handles forward', () => {
    mountRange([0.5, 0.6, 0.7])

    dragHandle(0, 50, 60)

    expect(lastChange()).toEqual([0.6, 0.7, 0.8])
  })

  // react-component/slider#1091
  it('pushes decimal handles backward', () => {
    mountRange([0.6, 0.7, 0.8])

    dragHandle(2, 80, 70)

    expect(lastChange()).toEqual([0.5, 0.6, 0.7])
  })
})

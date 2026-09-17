// @vitest-environment jsdom

import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Slider from '../src'

let wrapper: VueWrapper

function mountRange(props: Record<string, any> = {}) {
  wrapper = mount(Slider, {
    props: { range: true, pushable: 20, defaultValue: [20, 40], ...props },
  })

  // 宽度 100 映射 min..max（0..100），因此 clientX 30 对应数值 30
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

function clickTrack(clientX: number) {
  wrapper.element.dispatchEvent(
    new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX,
      clientY: 0,
    }),
  )
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
}

function lastChange() {
  return wrapper.emitted('change')?.at(-1)?.[0]
}

afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
})

describe('slider track click', () => {
  // react-component/slider#1092
  it('keeps pushable when clicking the track', () => {
    mountRange()

    clickTrack(30)

    expect(lastChange()).toEqual([10, 30])
  })

  // react-component/slider#1092
  it('keeps pushable when inserting an editable handle', () => {
    mountRange({ range: { editable: true } })

    clickTrack(30)

    expect(lastChange()).toEqual([10, 30, 50])
  })
})

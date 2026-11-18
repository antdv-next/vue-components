import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import ColorPicker from '../src'

function touchEvent(type: string, pageX?: number, pageY?: number) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  if (pageX !== undefined) {
    Object.defineProperty(event, 'touches', { value: [{ pageX, pageY }] })
  }
  return event
}

describe('color-picker touch cancel', () => {
  let rectSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ x: 0, y: 100, width: 100, height: 100, left: 0, top: 100, right: 100, bottom: 200 }) as DOMRect,
    )
  })

  afterEach(() => {
    rectSpy.mockRestore()
    document.body.innerHTML = ''
  })

  it('should stop dragging on touch cancel without completing the change', async () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    const wrapper = mount(
      () => <ColorPicker defaultValue="#163cff" onChange={onChange} onChangeComplete={onChangeComplete} />,
      { attachTo: document.body },
    )
    const select = wrapper.find('.vc-color-picker-select').element

    select.dispatchEvent(touchEvent('touchstart', 0, 175))
    document.dispatchEvent(touchEvent('touchmove', 0, 175))
    await nextTick()
    expect(onChange).toHaveBeenCalled()
    onChange.mockClear()

    document.dispatchEvent(touchEvent('touchcancel'))

    const outsideMove = touchEvent('touchmove', 25, 125)
    document.body.dispatchEvent(outsideMove)
    document.body.dispatchEvent(touchEvent('touchend'))
    await nextTick()
    expect(outsideMove.defaultPrevented).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
    expect(onChangeComplete).not.toHaveBeenCalled()

    select.dispatchEvent(touchEvent('touchstart', 0, 150))
    document.dispatchEvent(touchEvent('touchmove', 0, 150))
    document.dispatchEvent(touchEvent('touchend'))
    await nextTick()
    expect(onChange).toHaveBeenCalled()
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('should follow a dynamic disabled prop when starting a drag', async () => {
    const onChange = vi.fn()
    const disabled = ref(true)
    const wrapper = mount(
      () => <ColorPicker defaultValue="#163cff" disabled={disabled.value} onChange={onChange} />,
      { attachTo: document.body },
    )
    const select = wrapper.find('.vc-color-picker-select').element

    select.dispatchEvent(touchEvent('touchstart', 0, 175))
    document.dispatchEvent(touchEvent('touchend'))
    await nextTick()
    expect(onChange).not.toHaveBeenCalled()

    disabled.value = false
    await nextTick()
    select.dispatchEvent(touchEvent('touchstart', 0, 175))
    document.dispatchEvent(touchEvent('touchmove', 0, 150))
    document.dispatchEvent(touchEvent('touchend'))
    await nextTick()
    expect(onChange).toHaveBeenCalled()

    disabled.value = true
    await nextTick()
    onChange.mockClear()
    select.dispatchEvent(touchEvent('touchstart', 0, 125))
    document.dispatchEvent(touchEvent('touchmove', 0, 125))
    await nextTick()
    expect(onChange).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})

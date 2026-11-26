import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Steps from '../src'

// react-component/steps#402
describe('keyboard on nested focusable content', () => {
  function keydown(el: Element, key: string) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    el.dispatchEvent(event)
    return event
  }

  it('leaves Enter / Space untouched when they come from a nested input', () => {
    const onChange = vi.fn()
    const wrapper = mount(
      <Steps
        current={0}
        onChange={onChange}
        items={[{ title: 'A' }, { title: 'B', content: <input class="nested-input" /> }]}
      />,
      { attachTo: document.body },
    )
    const input = wrapper.find('.nested-input').element
    const space = keydown(input, ' ')
    const enter = keydown(input, 'Enter')
    expect(space.defaultPrevented).toBe(false)
    expect(enter.defaultPrevented).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('still activates the step when the key is pressed on the step itself', () => {
    const onChange = vi.fn()
    const wrapper = mount(
      <Steps current={0} onChange={onChange} items={[{ title: 'A' }, { title: 'B' }]} />,
      { attachTo: document.body },
    )
    const step = wrapper.findAll('[role="button"]')[1].element
    const event = keydown(step, 'Enter')
    expect(event.defaultPrevented).toBe(true)
    expect(onChange).toHaveBeenCalledWith(1)
    wrapper.unmount()
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Input from '../src/input'

describe('input IME composition guard', () => {
  it('should NOT trigger onChange during composition by default', async () => {
    const onChange = vi.fn()
    const wrapper = mount(Input, {
      props: { onChange },
    })
    const input = wrapper.find('input')

    // Simulate IME composition: compositionstart → input events → compositionend
    await input.trigger('compositionstart')
    await input.setValue('h')
    await input.trigger('input')
    await input.setValue('he')
    await input.trigger('input')
    await input.setValue('hei')
    await input.trigger('input')

    // During composition, onChange should not be called
    expect(onChange).not.toHaveBeenCalled()

    // compositionend with final value
    const inputEl = input.element as HTMLInputElement
    inputEl.value = '黑'
    await input.trigger('compositionend')
    await nextTick()

    // Only one call with the final value
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should trigger onChange during composition when changeOnComposing is true', async () => {
    const onChange = vi.fn()
    const wrapper = mount(Input, {
      props: { onChange, changeOnComposing: true },
    })
    const input = wrapper.find('input')

    await input.trigger('compositionstart')

    const inputEl = input.element as HTMLInputElement
    inputEl.value = 'h'
    await input.trigger('input')
    inputEl.value = 'he'
    await input.trigger('input')
    inputEl.value = 'hei'
    await input.trigger('input')

    // With changeOnComposing=true, onChange fires on every input during composition
    expect(onChange).toHaveBeenCalledTimes(3)

    inputEl.value = '黑'
    await input.trigger('compositionend')
    await nextTick()

    // compositionend also triggers onChange
    expect(onChange).toHaveBeenCalledTimes(4)
  })

  it('should trigger onChange normally for non-IME input', async () => {
    const onChange = vi.fn()
    const wrapper = mount(Input, {
      props: { onChange },
    })
    const input = wrapper.find('input')
    const inputEl = input.element as HTMLInputElement

    // Normal typing (no composition)
    inputEl.value = 'a'
    await input.trigger('input')
    inputEl.value = 'ab'
    await input.trigger('input')

    expect(onChange).toHaveBeenCalledTimes(2)
  })
})

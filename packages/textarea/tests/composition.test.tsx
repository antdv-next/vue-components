import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import TextArea from '../src/TextArea'

describe('textarea IME composition guard', () => {
  it('should NOT trigger onChange during composition by default', async () => {
    const onChange = vi.fn()
    const wrapper = mount(TextArea, {
      props: { onChange },
    })
    const textarea = wrapper.find('textarea')

    // Simulate IME composition
    await textarea.trigger('compositionstart')

    const el = textarea.element as HTMLTextAreaElement
    el.value = 'h'
    await textarea.trigger('input')
    el.value = 'he'
    await textarea.trigger('input')
    el.value = 'hei'
    await textarea.trigger('input')

    // During composition, onChange should not be called
    expect(onChange).not.toHaveBeenCalled()

    // compositionend with final value
    el.value = '黑'
    await textarea.trigger('compositionend')
    await nextTick()

    // Only one call with the final value
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should trigger onChange during composition when changeOnComposing is true', async () => {
    const onChange = vi.fn()
    const wrapper = mount(TextArea, {
      props: { onChange, changeOnComposing: true },
    })
    const textarea = wrapper.find('textarea')

    await textarea.trigger('compositionstart')

    const el = textarea.element as HTMLTextAreaElement
    el.value = 'h'
    await textarea.trigger('input')
    el.value = 'he'
    await textarea.trigger('input')
    el.value = 'hei'
    await textarea.trigger('input')

    // With changeOnComposing=true, onChange fires on every input during composition
    expect(onChange).toHaveBeenCalledTimes(3)

    el.value = '黑'
    await textarea.trigger('compositionend')
    await nextTick()

    // compositionend also triggers onChange
    expect(onChange).toHaveBeenCalledTimes(4)
  })

  it('should trigger onChange normally for non-IME input', async () => {
    const onChange = vi.fn()
    const wrapper = mount(TextArea, {
      props: { onChange },
    })
    const textarea = wrapper.find('textarea')
    const el = textarea.element as HTMLTextAreaElement

    // Normal typing (no composition)
    el.value = 'a'
    await textarea.trigger('input')
    el.value = 'ab'
    await textarea.trigger('input')

    expect(onChange).toHaveBeenCalledTimes(2)
  })
})

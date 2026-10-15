import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import TextArea from '../src/TextArea'

describe('textArea allowClear', () => {
  it('applies allowClear tabIndex to the clear button while keeping mouse clear', async () => {
    const onClear = vi.fn()
    const wrapper = mount(TextArea, {
      props: {
        defaultValue: 'test',
        allowClear: { tabIndex: -1 },
        onClear,
      },
      attachTo: document.body,
    })
    const textarea = wrapper.find('textarea')
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.element.tabIndex).toBe(-1)

    await button.trigger('click')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('')
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(textarea.element)
    wrapper.unmount()
  })
})

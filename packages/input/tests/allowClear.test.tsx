import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import Input from '../src/input'

/**
 * jsdom does not perform real Tab-key navigation. Simulate the browser tab
 * order instead: collect focusable elements in DOM order and drop disabled
 * ones and those with a negative tabIndex.
 */
function getTabOrder(root: Element) {
  return Array.from(root.querySelectorAll<HTMLElement>('input, button')).filter(
    el => !el.disabled && el.tabIndex >= 0,
  )
}

describe('input allowClear', () => {
  it.each([false, undefined])(
    'distinguishes allowClear=%s from a disabled clear button',
    async (allowClear) => {
      const wrapper = mount(Input, {
        props: { defaultValue: 'test', suffix: 'suffix', allowClear },
      })
      expect(wrapper.find('button').exists()).toBe(false)
      expect(wrapper.find('.vc-input-affix-wrapper').classes()).not.toContain(
        'vc-input-affix-wrapper-input-with-clear-btn',
      )

      await wrapper.setProps({
        allowClear: { disabled: true, clearIcon: 'clear', tabIndex: -1 },
      })
      const clearButton = wrapper.find('button')
      expect(clearButton.classes()).toContain('vc-input-clear-icon-hidden')
      expect(clearButton.text()).toBe('clear')
      expect(clearButton.element.tabIndex).toBe(-1)
      expect(wrapper.find('.vc-input-affix-wrapper').classes()).toContain(
        'vc-input-affix-wrapper-input-with-clear-btn',
      )

      await wrapper.setProps({ allowClear: true })
      expect(wrapper.find('button').element).toBe(clearButton.element)
      expect(clearButton.classes()).not.toContain('vc-input-clear-icon-hidden')
      expect(clearButton.text()).toBe('✖')
      expect(clearButton.element.tabIndex).toBe(0)

      await wrapper.setProps({ allowClear })
      expect(wrapper.find('button').exists()).toBe(false)
      expect(wrapper.find('.vc-input-affix-wrapper').classes()).not.toContain(
        'vc-input-affix-wrapper-input-with-clear-btn',
      )
    },
  )

  it.each([true, {}, { tabIndex: 0 }])(
    'keeps the clear button keyboard accessible with %j',
    async (allowClear) => {
      const wrapper = mount(Input, {
        props: { defaultValue: 'test', allowClear },
        attachTo: document.body,
      })
      const input = wrapper.find('input')
      const button = wrapper.find('button')
      expect(button.element.tabIndex).toBe(0)

      // Simulate tabbing from the input to the clear button, then activating
      // it (browsers map Enter on a focused button to a click event).
      input.element.focus()
      expect(document.activeElement).toBe(input.element)
      button.element.focus()
      expect(document.activeElement).toBe(button.element)
      await button.trigger('click')
      expect((input.element as HTMLInputElement).value).toBe('')
      expect(document.activeElement).toBe(input.element)
      wrapper.unmount()
    },
  )

  it('skips the clear button in both tab directions while allowing click to clear', async () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    const wrapper = mount(
      {
        setup: () => () => (
          <div>
            <Input
              defaultValue="test"
              allowClear={{ tabIndex: -1 }}
              onChange={onChange}
              onClear={onClear}
            />
            <Input defaultValue="second" allowClear />
          </div>
        ),
      },
      { attachTo: document.body },
    )
    const inputs = wrapper.findAll('input')
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)

    // Forward and reverse tab order both skip the -1 button of the first
    // input while still reaching the default button of the second input.
    const order = getTabOrder(wrapper.element)
    expect(order).toEqual([
      inputs[0].element,
      inputs[1].element,
      buttons[1].element,
    ])
    expect(order.slice().reverse()).not.toContain(buttons[0].element)

    // Mouse interaction still clears the first input.
    await buttons[0].trigger('click')
    expect((inputs[0].element as HTMLInputElement).value).toBe('')
    expect(document.activeElement).toBe(inputs[0].element)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onClear).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('updates the clear button tabIndex independently of the input', async () => {
    const currentProps = reactive({
      defaultValue: 'test',
      tabIndex: 3,
      allowClear: { tabIndex: 2 } as any,
    })
    const wrapper = mount(() => <Input {...currentProps} />, {
      attachTo: document.body,
    })
    expect(wrapper.find('input').element.tabIndex).toBe(3)
    expect(wrapper.find('button').element.tabIndex).toBe(2)

    Object.assign(currentProps, { allowClear: true })
    await nextTick()
    expect(wrapper.find('button').element.tabIndex).toBe(0)
    expect(wrapper.find('input').element.tabIndex).toBe(3)
    wrapper.unmount()
  })
})

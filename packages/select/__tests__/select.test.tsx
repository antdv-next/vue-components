import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Option from '../src/Option'
import Select from '../src/Select'

async function flushSelect() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve))
  await nextTick()
}

describe('select react sync', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('does not add has-value class when selected label is empty string', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        value: '',
        options: [{ value: '', label: '' }, { value: '1', label: '1' }],
      },
    })

    await flushSelect()

    expect(wrapper.find('.vc-select-content-has-value').exists()).toBe(false)

    wrapper.unmount()
  })

  it('adds has-value class when selected label is number 0', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        value: 0,
        options: [{ value: 0, label: 0 }, { value: 1, label: 1 }],
      },
    })

    await flushSelect()

    expect(wrapper.find('.vc-select-content-has-value').exists()).toBe(true)

    wrapper.unmount()
  })

  it('does not add has-value class when selected label is whitespace only', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        value: 'blank',
        options: [{ value: 'blank', label: '   ' }, { value: '1', label: '1' }],
      },
    })

    await flushSelect()

    expect(wrapper.find('.vc-select-content-has-value').exists()).toBe(false)

    wrapper.unmount()
  })

  it('does not prevent default on space when showSearch is enabled', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        showSearch: true,
        options: [{ value: 'test', label: 'test' }],
      },
    })

    await flushSelect()

    const input = wrapper.find('input')
    const event = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      bubbles: true,
    })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    input.element.dispatchEvent(event)

    expect(preventDefaultSpy).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('prevents default on space when showSearch is disabled', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        options: [{ value: 'test', label: 'test' }],
      },
    })

    await flushSelect()

    const input = wrapper.find('input')
    const event = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      bubbles: true,
    })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    input.element.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('keeps dropdown open when mousedown on input in multiple mode', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        mode: 'multiple',
        showSearch: true,
        defaultOpen: true,
        options: [{ value: 'light', label: 'Light' }],
      },
    })

    await flushSelect()

    expect(document.body.querySelector('.vc-select-item-option-content')?.textContent?.trim()).toBe('Light')

    await wrapper.find('input').trigger('mousedown')
    await flushSelect()

    expect(document.body.querySelector('.vc-select-item-option-content')?.textContent?.trim()).toBe('Light')

    wrapper.unmount()
  })

  it('does not render content value in combobox mode with custom input', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        mode: 'combobox',
        value: '1',
        placeholder: 'Input value',
        getInputElement: () => <input />,
      },
      slots: {
        default: () => [
          <Option value="1">One</Option>,
          <Option value="2">Two</Option>,
        ],
      },
    })

    await flushSelect()

    expect(wrapper.find('.vc-select-content-value').exists()).toBe(false)
    expect(wrapper.find('.vc-select-placeholder').exists()).toBe(false)
    expect(wrapper.find('input').element.getAttribute('placeholder')).toBe('Input value')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('1')

    wrapper.unmount()
  })

  it('merges custom raw input focus and blur handlers', async () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()

    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        showSearch: true,
        options: [{ value: 'a', label: 'A' }],
        getRawInputElement: () => <input placeholder="focus me" onFocus={onFocus} onBlur={onBlur} />,
      },
    })

    await flushSelect()

    const input = wrapper.get('input')
    await input.trigger('focus')
    await input.trigger('blur')

    expect(onFocus).toHaveBeenCalled()
    expect(onBlur).toHaveBeenCalled()

    wrapper.unmount()
  })
})

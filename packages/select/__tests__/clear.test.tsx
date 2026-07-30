import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Select from '../src/Select'

async function flushSelect() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve))
  await nextTick()
}

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
]

describe('select clear', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the clear affordance as a labelled button', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { value: 'a', options, allowClear: true },
    })
    await flushSelect()

    const clear = wrapper.find('.vc-select-clear')
    expect(clear.exists()).toBe(true)
    // A plain div is not reachable by keyboard or announced by a screen reader.
    expect(clear.element.tagName).toBe('BUTTON')
    expect(clear.attributes('type')).toBe('button')
    expect(clear.attributes('aria-label')).toBe('Clear')

    wrapper.unmount()
  })

  it('allows customising the clear label', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { value: 'a', options, allowClear: { label: '清除' } },
    })
    await flushSelect()

    expect(wrapper.find('.vc-select-clear').attributes('aria-label')).toBe('清除')

    wrapper.unmount()
  })

  it('clears on click so keyboard activation works too', async () => {
    const onChange = vi.fn()
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { value: 'a', options, allowClear: true, onChange },
    })
    await flushSelect()

    await wrapper.find('.vc-select-clear').trigger('click')
    await flushSelect()

    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls[0][0]).toBeUndefined()

    wrapper.unmount()
  })

  // The test-utils wrapper root is not the select element itself, so read the
  // open state off the rendered DOM.
  const isOpen = () => !!document.querySelector('.vc-select')?.classList.contains('vc-select-open')

  it('keeps a multiple select open when clearing', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { mode: 'multiple', value: ['a'], options, allowClear: true },
    })
    await flushSelect()

    // Open the dropdown first.
    await wrapper.find('.vc-select-content').trigger('mousedown')
    await flushSelect()
    expect(isOpen()).toBe(true)

    const clear = wrapper.find('.vc-select-clear')
    await clear.trigger('mousedown')
    await clear.trigger('click')
    await flushSelect()

    // Single select closes on clear, multiple stays open so more can be picked.
    expect(isOpen()).toBe(true)

    wrapper.unmount()
  })

  it('closes a single select when clearing', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { value: 'a', options, allowClear: true },
    })
    await flushSelect()

    await wrapper.find('.vc-select-content').trigger('mousedown')
    await flushSelect()
    expect(isOpen()).toBe(true)

    const clear = wrapper.find('.vc-select-clear')
    await clear.trigger('mousedown')
    await clear.trigger('click')
    await flushSelect()

    expect(isOpen()).toBe(false)

    wrapper.unmount()
  })
})

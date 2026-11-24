import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Select from '../src'

async function flushSelect() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve))
  await nextTick()
}

function keyDown(element: HTMLElement, keyCode: number) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'which', { value: keyCode })
  Object.defineProperty(event, 'keyCode', { value: keyCode })
  element.dispatchEvent(event)
}

afterEach(() => {
  document.body.innerHTML = ''
})

// react-component/select#1254
describe('zero-valued dropdown content and icons', () => {
  it('opens an empty dropdown containing zero', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { open: true, options: [], notFoundContent: 0 as any },
    })
    await flushSelect()

    expect(document.body.querySelector('.vc-select-item-empty')?.textContent).toBe('0')

    wrapper.unmount()
  })

  it('only renders a zero selection icon on selected options', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        open: true,
        mode: 'multiple',
        value: ['a'],
        virtual: false,
        menuItemSelectedIcon: 0 as any,
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
      },
    })
    await flushSelect()

    expect(document.body.querySelectorAll('.vc-select-item-option-state')).toHaveLength(1)
    expect(
      document.body.querySelector('.vc-select-item-option-selected .vc-select-item-option-state')?.textContent,
    ).toBe('0')

    wrapper.unmount()
  })

  it('keeps a zero option label in the dropdown and selected value', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: { open: true, value: 'a', options: [{ value: 'a', label: 0 }] },
    })
    await flushSelect()

    expect(document.body.querySelector('.vc-select-item-option-content')?.textContent).toBe('0')
    expect(document.body.querySelector('.vc-select-content-has-value')).toBeTruthy()

    wrapper.unmount()
  })
})

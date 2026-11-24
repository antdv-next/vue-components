import KeyCode from '@v-c/util/dist/KeyCode'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Select from '../src'
import { getNextActiveIndex } from '../src/utils/keyUtil'

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

// react-component/select#1263
describe('upward keyboard navigation without active option', () => {
  it('getNextActiveIndex', () => {
    expect(getNextActiveIndex(-1, -1)).toBe(-1)
    expect(getNextActiveIndex(-1, 1)).toBe(0)
    expect(getNextActiveIndex(2, -1)).toBe(1)
    expect(getNextActiveIndex(1, 1)).toBe(2)
  })

  it('starts at the last option when pressing UP with no active option', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        open: true,
        defaultActiveFirstOption: false,
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' },
        ],
      },
    })
    await flushSelect()

    expect(document.body.querySelector('.vc-select-item-option-active')).toBeNull()

    keyDown(wrapper.find('input').element, KeyCode.UP)
    await flushSelect()

    const active = document.body.querySelector('.vc-select-item-option-active .vc-select-item-option-content')
    expect(active?.textContent?.trim()).toBe('C')

    wrapper.unmount()
  })
})

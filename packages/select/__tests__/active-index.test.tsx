import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Select from '../src'

describe('select active index', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('uses selected option as active on first render', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        open: true,
        value: 'b',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' },
        ],
      },
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve))
    await nextTick()

    const active = document.body.querySelector('.vc-select-item-option-active .vc-select-item-option-content')

    expect(active?.textContent?.trim()).toBe('B')

    wrapper.unmount()
  })

  it('scrolls to selected option on first open render', async () => {
    const originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get() {
        const element = this as HTMLElement
        const raw = element.style.height || element.style.maxHeight || '0'
        const height = Number.parseFloat(raw)
        return Number.isNaN(height) ? 0 : height
      },
    })

    const options = Array.from({ length: 30 }, (_, index) => ({
      label: `Option ${index}`,
      value: String(index),
    }))

    try {
      const wrapper = mount(Select, {
        attachTo: document.body,
        props: {
          open: true,
          value: '20',
          options,
          listHeight: 100,
          listItemHeight: 20,
        },
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve))
      await nextTick()

      // OptionList names its virtual list after the select prefix, so the
      // holder is `-dropdown-list-holder` rather than the generic one.
      const holder = document.body.querySelector('.vc-select-dropdown-list-holder') as HTMLDivElement | null
      expect(holder).toBeTruthy()
      expect((holder as HTMLDivElement).scrollTop).toBeGreaterThan(0)

      wrapper.unmount()
    }
    finally {
      if (originalClientHeight) {
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', originalClientHeight)
      }
    }
  })
})

describe('select', () => {
  it('should support showSearch optionFilterProp config', async () => {
    const wrapper = mount(Select, {
      props: {
        open: true,
        showSearch: { optionFilterProp: 'label' },
        options: [
          { label: '张三', value: 'zhangsan' },
          { label: '李四', value: 'lisi' },
        ],
      },
      attachTo: document.body,
    })

    await nextTick()
    await wrapper.find('input').setValue('张')
    await nextTick()

    const options = Array.from(
      document.querySelectorAll('.vc-select-item-option-content'),
    ).map(item => item.textContent)
    expect(options).toEqual(['张三'])

    await wrapper.setProps({ open: false })
    await nextTick()
    wrapper.unmount()
  })
})

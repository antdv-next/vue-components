import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Select from '../src/Select'

async function flush() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

describe('select filterOption flash fix', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('single select with custom filterOption should not flash all options when clicking filtered item', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        showSearch: true,
        defaultOpen: true,
        filterOption: (input: string, option: any) =>
          String(option.label).toLowerCase().includes(input.toLowerCase()),
        options: [
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'cherry', label: 'Cherry' },
        ],
      },
    })
    await flush()
    await wrapper.setProps({ searchValue: 'ap' } as any)
    await flush()

    // Filtered by custom filterOption: 'ap' only matches Apple
    expect(document.body.querySelectorAll('.vc-select-item-option').length).toBe(1)
    expect(document.body.querySelector('.vc-select-item-option-content')?.textContent?.trim()).toBe('Apple')

    // Click the filtered option
    const optionEl = document.body.querySelector('.vc-select-item-option') as HTMLElement
    optionEl.click()
    await nextTick()

    // During closing animation, memoFlattenOptions should stay frozen to filtered list
    // (bug would restore to 3 options instantly before dropdown disappears)
    expect(document.body.querySelectorAll('.vc-select-item-option').length).toBe(1)

    // Wait for close macroTask + animation
    await new Promise(resolve => setTimeout(resolve, 50))
    await nextTick()

    wrapper.unmount()
  })

  it('single select with default filterOption should also freeze during close', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        showSearch: true,
        defaultOpen: true,
        // no custom filterOption, use default
        options: [
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'cherry', label: 'Cherry' },
        ],
      },
    })
    await flush()
    await wrapper.setProps({ searchValue: 'ap' } as any)
    await flush()

    // default filter: 'ap' matches Apple
    expect(document.body.querySelectorAll('.vc-select-item-option').length).toBe(1)

    const optionEl = document.body.querySelector('.vc-select-item-option') as HTMLElement
    optionEl.click()
    await nextTick()

    expect(document.body.querySelectorAll('.vc-select-item-option').length).toBe(1)

    await new Promise(resolve => setTimeout(resolve, 50))
    await nextTick()
    wrapper.unmount()
  })

  it('multiple mode should still clear search and show all options after select (not frozen forever)', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        mode: 'multiple',
        showSearch: true,
        defaultOpen: true,
        filterOption: (input: string, option: any) =>
          String(option.label).toLowerCase().includes(input.toLowerCase()),
        options: [
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'cherry', label: 'Cherry' },
        ],
      },
    })
    await flush()
    await wrapper.setProps({ searchValue: 'ap' } as any)
    await flush()

    expect(document.body.querySelectorAll('.vc-select-item-option').length).toBe(1)

    const optionEl = document.body.querySelector('.vc-select-item-option') as HTMLElement
    optionEl.click()
    await flush()

    // In multiple mode dropdown stays open and searchValue cleared, so all options visible
    // This ensures our freeze does not block updates when open && !lock
    expect(document.body.querySelectorAll('.vc-select-item-option').length).toBe(3)

    wrapper.unmount()
  })
})

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Select from '../src/Select'

async function flush() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

describe('select optionFilterProp array', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('filters by multiple fields with OR matching', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        showSearch: true,
        // @ts-ignore - string[] support
        optionFilterProp: ['label', 'otherField'],
        defaultOpen: true,
        options: [
          { value: 'a11', label: 'a11', otherField: 'c11' },
          { value: 'b22', label: 'b22', otherField: 'b11' },
          { value: 'c33', label: 'c33', otherField: 'b33' },
          { value: 'd44', label: 'd44', otherField: 'd44' },
        ],
      },
    })
    await flush()
    // initial all 4 visible
    expect(document.body.querySelectorAll('.vc-select-item-option').length).toBe(4)

    // search "b11" should match b22 via otherField, not label
    await wrapper.setProps({ searchValue: 'b11' })
    await flush()
    const items = Array.from(document.body.querySelectorAll('.vc-select-item-option-content')).map(el => el.textContent?.trim())
    // b22's label is b22 but otherField b11 matches
    expect(items).toContain('b22')
    expect(items.length).toBe(1)

    // search "a11" matches label
    await wrapper.setProps({ searchValue: 'a11' })
    await flush()
    const items2 = Array.from(document.body.querySelectorAll('.vc-select-item-option-content')).map(el => el.textContent?.trim())
    expect(items2).toContain('a11')
    expect(items2.length).toBe(1)

    wrapper.unmount()
  })

  it('supports showSearch.optionFilterProp as array', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        // @ts-ignore
        showSearch: { optionFilterProp: ['label', 'otherField'] },
        defaultOpen: true,
        options: [
          { value: 'a11', label: 'a11', otherField: 'c11' },
          { value: 'b22', label: 'b22', otherField: 'b11' },
        ],
      },
    })
    await flush()
    await wrapper.setProps({ searchValue: 'c11' })
    await flush()
    const items = Array.from(document.body.querySelectorAll('.vc-select-item-option-content')).map(el => el.textContent?.trim())
    expect(items).toContain('a11')
    expect(items.length).toBe(1)
    wrapper.unmount()
  })
})

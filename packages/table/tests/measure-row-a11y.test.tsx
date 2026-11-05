// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Table from '../src'

// react-component/table#1525: keep controls in the measure row out of the tab order
describe('table measure row', () => {
  it('is hidden and inert so copied title controls cannot take focus', () => {
    const wrapper = mount(Table, {
      props: {
        scroll: { x: 300, y: 100 },
        columns: [{ key: 'a', dataIndex: 'a', title: () => <input type="checkbox" class="title-check" /> }],
        data: [{ key: 1, a: 1 }],
      } as any,
    })
    const row = wrapper.find<HTMLTableRowElement>('.vc-table-measure-row')
    expect(row.exists()).toBe(true)
    expect(row.attributes('aria-hidden')).toBe('true')
    expect(row.element.hasAttribute('inert')).toBe(true)
    expect(row.element.style.visibility).toBe('hidden')
    wrapper.unmount()
  })
})

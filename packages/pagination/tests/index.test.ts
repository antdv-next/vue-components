import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Pagination from '../src/index'

describe('default Pagination', () => {
  let wrapper: VueWrapper
  const onChange = vi.fn()

  const $$ = (selector: string) => wrapper.findAll(selector)
  beforeEach(() => {
    wrapper = mount(Pagination, {
      onChange,
    })
  })

  afterEach(() => {
    wrapper.unmount()
    onChange.mockReset()
  })

  it('onChange should be forbidden when total is default', async () => {
    const pages = $$('.vc-pagination-item')
    await pages[0].trigger('click')
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('pager item count', () => {
  const currentList = [1, 2, 3, 4, 5, 6, 50, 95, 96, 97, 98, 99, 100]

  it('should keep pager item count when jumpers appear', () => {
    currentList.forEach((current) => {
      const wrapper = mount(Pagination, {
        props: {
          total: 1000,
          current,
          showQuickJumper: true,
          onChange: vi.fn(),
        },
      })

      const pagerItems = wrapper.findAll(
        'li:not(.vc-pagination-prev):not(.vc-pagination-next):not(.vc-pagination-options)',
      )
      expect(pagerItems.length, `current page ${current}`).toBe(7)
      wrapper.unmount()
    })
  })
})

import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import Pagination from '../src/index'
import zhTW from '../src/locale/zh_TW'

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

describe('locale zh_TW', () => {
  it('uses the Traditional Chinese page-size terminology', () => {
    const wrapper = mount(Pagination, {
      props: {
        total: 100,
        locale: zhTW,
        showSizeChanger: true,
        sizeChangerRender: ({ size, 'aria-label': ariaLabel, className, options, onSizeChange }) =>
          h(
            'select',
            {
              'aria-label': ariaLabel,
              'class': className,
              'value': size,
              'onChange': (event: Event) => onSizeChange((event.target as HTMLSelectElement).value),
            },
            options.map(option => h('option', { value: option.value }, String(option.label))),
          ),
        onChange: vi.fn(),
      },
    })

    const sizeChanger = wrapper.find('select.vc-pagination-options-size-changer')
    expect(sizeChanger.attributes('aria-label')).toBe('每頁筆數')
    expect(sizeChanger.findAll('option').map(option => option.text())).toContain('10 筆／頁')

    wrapper.unmount()
  })
})

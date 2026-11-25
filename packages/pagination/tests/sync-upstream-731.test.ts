import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Pagination from '../src/index'
import enUS from '../src/locale/en_US'
import tgTJ from '../src/locale/tg_TJ'

// react-component/pagination#731
describe('locale tg_TJ', () => {
  it('provides every key of en_US', () => {
    expect(Object.keys(tgTJ).sort()).toEqual(Object.keys(enUS).sort())
    Object.values(tgTJ).forEach((value) => {
      expect(typeof value).toBe('string')
      expect(value).not.toBe('')
    })
  })

  it('renders with tg_TJ locale', () => {
    const wrapper = mount(Pagination, { props: { total: 100, locale: tgTJ } })
    const html = wrapper.html()
    expect(html).toContain('Саҳифаи қаблӣ')
    expect(html).toContain('Саҳифаи баъдӣ')
    wrapper.unmount()
  })
})

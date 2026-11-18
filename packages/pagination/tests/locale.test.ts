import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Pagination from '../src/index'
import enUS from '../src/locale/en_US'
import uzCyrlUZ from '../src/locale/uz_Cyrl_UZ'

describe('locale uz_Cyrl_UZ', () => {
  it('provides every key of en_US', () => {
    expect(Object.keys(uzCyrlUZ).sort()).toEqual(Object.keys(enUS).sort())
    Object.values(uzCyrlUZ).forEach((value) => {
      expect(typeof value).toBe('string')
      expect(value).not.toBe('')
    })
  })

  it('renders with uz_Cyrl_UZ locale', () => {
    const wrapper = mount(Pagination, {
      props: {
        total: 100,
        locale: uzCyrlUZ,
      },
    })
    const html = wrapper.html()
    expect(html).toContain('Орқага')
    expect(html).toContain('Олдинга')
    wrapper.unmount()
  })
})

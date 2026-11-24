import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Steps from '../src'

// react-component/steps#399
describe('zero-valued step content and icon', () => {
  it('preserves a zero itemRender result', () => {
    const wrapper = mount(<Steps items={[{ title: 'A' }]} itemRender={() => 0 as any} />)
    expect(wrapper.element.textContent).toBe('0')
  })

  it('marks a zero icon as custom', () => {
    const wrapper = mount(<Steps items={[{ title: 'A', icon: 0 as any }]} />)
    expect(wrapper.find('.vc-steps-item').classes()).toContain('vc-steps-item-custom')
  })

  it.each([false, null, undefined, ''])('keeps an empty itemRender result hidden: %s', (value) => {
    const wrapper = mount(<Steps items={[{ title: 'A' }]} itemRender={() => value as any} />)
    expect(wrapper.find('.vc-steps').text()).toBe('')
  })
})

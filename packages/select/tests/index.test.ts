import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Select from '../src'

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

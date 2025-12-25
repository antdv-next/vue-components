import type { CascaderProps } from '../src'
import { defineComponent, ref } from 'vue'
import Cascader from '../src'
import type { Option2 } from './utils'
import './assets/index.less'

const options = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          {
            value: 'xihu',
            label: '西湖',
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      {
        value: 'nanjing',
        label: '南京',
        children: [
          {
            value: 'zhonghuamen',
            label: '中华门',
          },
        ],
      },
    ],
  },
]

export default defineComponent({
  name: 'CascaderDefaultExpandSingleOptionDemo',
  setup() {
    const inputValue = ref('')
    const value = ref<string[]>([])

    const onChange: CascaderProps<Option2, 'value'>['onChange'] = (nextValue, selectedOptions) => {
      const lastSelected = selectedOptions[selectedOptions.length - 1] as Option2
      if (lastSelected?.children && lastSelected.children.length === 1) {
        const mergedValue = [...(nextValue as string[]), lastSelected.children[0].value as string]
        inputValue.value = selectedOptions.map(o => o.label).join(', ')
        value.value = mergedValue
        return
      }
      inputValue.value = selectedOptions.map(o => o.label).join(', ')
      value.value = nextValue as string[]
    }

    return () => (
      <Cascader options={options} value={value.value} changeOnSelect onChange={onChange}>
        <input value={inputValue.value} readOnly />
      </Cascader>
    )
  },
})

import type { CascaderProps } from '../src'
import { defineComponent, ref } from 'vue'
import Cascader from '../src'
import type { Option2 } from './utils'
import './assets/index.less'

const addressOptions = [
  {
    label: '福建',
    isLeaf: false,
    value: 'fj',
  },
  {
    label: '浙江',
    isLeaf: false,
    value: 'zj',
  },
]

export default defineComponent({
  name: 'CascaderDynamicOptionsDemo',
  setup() {
    const inputValue = ref('')
    const options = ref(addressOptions)

    const onChange: CascaderProps<Option2>['onChange'] = (value, selectedOptions) => {
      console.log('OnChange:', value, selectedOptions)
      inputValue.value = selectedOptions.map(o => o.label).join(', ')
    }

    const loadData: CascaderProps<Option2>['loadData'] = (selectedOptions) => {
      console.log('onLoad:', selectedOptions)
      const targetOption = selectedOptions[selectedOptions.length - 1]
      targetOption.loading = true
      setTimeout(() => {
        targetOption.loading = false
        targetOption.children = [
          {
            label: `${targetOption.label}动态加载1`,
            value: 'dynamic1',
            isLeaf: false,
          },
          {
            label: `${targetOption.label}动态加载2`,
            value: 'dynamic2',
          },
        ]
        options.value = [...options.value]
      }, 500)
    }

    return () => (
      <Cascader
        options={options.value}
        loadData={loadData}
        onChange={onChange}
        loadingIcon="💽"
        changeOnSelect
      >
        <input value={inputValue.value} readOnly />
      </Cascader>
    )
  },
})

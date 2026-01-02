import type { CascaderProps } from '../src'
import type { Option2 } from './utils'
import { defineComponent, ref } from 'vue'
import Cascader from '../src'
import './assets/index.less'

const { SHOW_CHILD } = Cascader

const optionLists = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    isLeaf: false,
    disableCheckbox: true,
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    isLeaf: false,
    disableCheckbox: false,
  },
]

export default defineComponent({
  name: 'CascaderMultipleDemo',
  setup() {
    const options = ref(optionLists)
    const value = ref<string[][]>([])

    const onChange: CascaderProps<Option2, 'value', true>['onChange'] = (nextValue, selectedOptions) => {
      console.log(nextValue, selectedOptions)
      value.value = nextValue as string[][]
    }

    const loadData: CascaderProps<Option2, 'value'>['loadData'] = (selectedOptions) => {
      const targetOption = selectedOptions[selectedOptions.length - 1]
      targetOption.loading = true

      setTimeout(() => {
        targetOption.loading = false
        targetOption.children = [
          {
            label: `${targetOption.label} Dynamic 1`,
            value: 'dynamic1',
            disableCheckbox: false,
          },
          {
            label: `${targetOption.label} Dynamic 2`,
            value: 'dynamic2',
            disableCheckbox: true,
          },
        ]
        options.value = [...options.value]
      }, 1000)
    }

    return () => (
      <Cascader
        checkable
        options={options.value}
        showCheckedStrategy={SHOW_CHILD}
        loadData={loadData}
        value={value.value}
        onChange={onChange}
        changeOnSelect
      />
    )
  },
})

import type { CascaderProps } from '../src'
import { defineComponent, ref } from 'vue'
import Cascader from '../src'
import type { Option2 } from './utils'
import { arrayTreeFilter } from './utils'
import './assets/index.less'

const addressOptions = [
  {
    label: '福建',
    value: 'fj',
    children: [
      {
        label: '福州',
        value: 'fuzhou',
        children: [
          {
            label: '马尾',
            value: 'mawei',
          },
        ],
      },
      {
        label: '泉州',
        value: 'quanzhou',
      },
    ],
  },
  {
    label: '浙江',
    value: 'zj',
    children: [
      {
        label: '杭州',
        value: 'hangzhou',
        children: [
          {
            label: '余杭',
            value: 'yuhang',
          },
        ],
      },
    ],
  },
  {
    label: '北京',
    value: 'bj',
    children: [
      {
        label: '朝阳区',
        value: 'chaoyang',
      },
      {
        label: '海淀区',
        value: 'haidian',
      },
    ],
  },
]

export default defineComponent({
  name: 'CascaderValueDemo',
  setup() {
    const value = ref<string[]>([])

    const onChange: CascaderProps<Option2, 'value'>['onChange'] = (nextValue) => {
      console.log(nextValue)
      value.value = nextValue as string[]
    }

    const handleSetValue = () => {
      value.value = ['bj', 'chaoyang']
    }

    const getLabel = () => {
      return arrayTreeFilter(addressOptions, (o, level) => o.value === value.value[level])
        .map(o => o.label)
        .join(', ')
    }

    return () => (
      <div>
        <button onClick={handleSetValue}>set value to 北京朝阳区</button>
        <Cascader value={value.value} options={addressOptions} onChange={onChange}>
          <input value={getLabel()} readOnly />
        </Cascader>
      </div>
    )
  },
})

import { defineComponent, ref } from 'vue'
import Cascader from '../src'
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
  name: 'CascaderVisibleDemo',
  setup() {
    const value = ref<string[]>([])
    const open = ref(false)

    const getLabel = () => {
      return arrayTreeFilter(addressOptions, (o, level) => o.value === value.value[level])
        .map(o => o.label)
        .join(', ')
    }

    return () => (
      <Cascader
        open={open.value}
        value={value.value}
        options={addressOptions}
        onPopupVisibleChange={(nextOpen) => {
          open.value = nextOpen
        }}
        onChange={(nextValue: any) => {
          value.value = nextValue
        }}
      >
        <input value={getLabel()} readOnly />
      </Cascader>
    )
  },
})

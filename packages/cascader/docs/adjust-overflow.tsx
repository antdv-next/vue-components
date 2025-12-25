import type { BuildInPlacements } from '@v-c/trigger'
import type { CascaderProps } from '../src'
import { defineComponent, ref } from 'vue'
import Cascader from '../src'
import type { Option2 } from './utils'
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
        disabled: true,
      },
    ],
  },
]

const MyCascader = defineComponent<{ builtinPlacements?: BuildInPlacements }>((props) => {
  const inputValue = ref('')

  const onChange: CascaderProps<Option2>['onChange'] = (value, selectedOptions) => {
    console.log(value, selectedOptions)
    inputValue.value = selectedOptions.map(o => o.label).join(', ')
  }

  return () => (
    <Cascader
      options={addressOptions}
      builtinPlacements={props.builtinPlacements}
      onChange={onChange}
    >
      <input
        placeholder={props.builtinPlacements ? 'Will not adjust position' : 'Will adjust position'}
        value={inputValue.value}
        style={{ width: '170px' }}
        readOnly
      />
    </Cascader>
  )
})

const placements: BuildInPlacements = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustY: 1,
    },
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustY: 1,
    },
  },
}

export default defineComponent({
  name: 'CascaderAdjustOverflowDemo',
  setup() {
    return () => (
      <div>
        <MyCascader />
        <br />
        <br />
        <MyCascader builtinPlacements={placements} />
      </div>
    )
  },
})

import { defineComponent, ref } from 'vue'
import Cascader from '../src'
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
  name: 'CascaderPanelDemo',
  setup() {
    const value = ref<string[]>([])
    const value2 = ref<string[][]>([])
    const disabled = ref(false)

    return () => (
      <>
        <h1>Panel</h1>
        <button
          onClick={() => {
            value.value = ['bj', 'haidian']
          }}
        >
          Set Value
        </button>
        <button
          onClick={() => {
            disabled.value = !disabled.value
          }}
        >
          {disabled.value ? 'enable panel' : 'disable panel'}
        </button>
        <Cascader.Panel
          value={value.value}
          options={addressOptions}
          onChange={(nextValue: any) => {
            console.log('Change:', nextValue)
            value.value = nextValue
          }}
          disabled={disabled.value}
        />

        <Cascader.Panel
          checkable
          value={value2.value}
          options={addressOptions}
          onChange={(nextValue: any) => {
            console.log('Change:', nextValue)
            value2.value = nextValue
          }}
          disabled={disabled.value}
        />

        <Cascader.Panel options={addressOptions} disabled={disabled.value} direction="rtl" />

        <Cascader.Panel notFoundContent="Empty!!!" />
      </>
    )
  },
})

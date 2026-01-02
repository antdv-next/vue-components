import { defineComponent, ref } from 'vue'
import Cascader from '../src'
import type { Option2 } from './utils'
import './assets/index.less'

const addressOptions: Option2[] = [
  {
    label: <span>空孩子</span>,
    value: 'empty',
    children: [],
  },
  {
    label: '福建',
    value: 'fj',
    title: '测试标题',
    children: [
      {
        label: '福州',
        value: 'fuzhou',
        disabled: true,
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
            label: '禁用',
            value: 'disabled',
            disabled: true,
          },
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
      {
        label: 'TEST',
        value: 'test',
      },
    ],
  },
  {
    label: '顶层禁用',
    value: 'disabled',
    disabled: true,
    children: [
      {
        label: '看不见',
        value: 'invisible',
      },
    ],
  },
]

export default defineComponent({
  name: 'CascaderDebugDemo',
  setup() {
    const multiple = ref(true)

    const onChange = (value: string[], selectedOptions: Option2[]) => {
      console.log('[DEBUG] onChange - value:', value)
      console.log('[DEBUG] onChange - selectedOptions:', selectedOptions)
    }

    return () => (
      <>
        <label>
          <input
            type="checkbox"
            checked={multiple.value}
            onChange={() => {
              multiple.value = !multiple.value
            }}
          />
          Multiple
        </label>
        {multiple.value
          ? (
            <Cascader
              style={{ width: '200px' }}
              checkable
              defaultValue={[['fj'], ['fuzhou']]}
              showSearch
            />
          )
          : (
            <Cascader
              style={{ width: '200px' }}
              options={addressOptions}
              onChange={onChange}
              checkable={false}
              allowClear
              defaultValue={['fj', 'fuzhou']}
              showSearch
            />
          )}
      </>
    )
  },
})

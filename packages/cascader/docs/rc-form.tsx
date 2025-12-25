import type { CascaderProps } from '../src'
import type { Option2 } from './utils'
import { omit } from '@v-c/util'
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

const CascaderInput = defineComponent<{
  value?: string[]
  onChange?: (value: string[]) => void
  options: Option2[]
  placeholder?: string
}>((props) => {
  const onChange: CascaderProps<Option2>['onChange'] = (value) => {
    if (props.onChange) {
      props.onChange(value as string[])
    }
  }

  const getLabel = () => {
    const value = props.value || []
    return arrayTreeFilter(props.options, (o, level) => o.value === value[level])
      .map(o => o.label)
      .join(', ')
  }

  return () => (
    <Cascader {...omit(props, ['onChange']) as any} onChange={onChange}>
      <input placeholder={props.placeholder} value={getLabel()} readonly />
    </Cascader>
  )
})

export default defineComponent({
  name: 'CascaderFormDemo',
  setup() {
    const value = ref<string[]>([])
    const error = ref('')

    const validate = () => {
      if (!value.value?.length) {
        error.value = 'cascader 需要必填'
        return false
      }
      error.value = ''
      return true
    }

    const onSubmit = (e: Event) => {
      e.preventDefault()
      if (!validate()) {
        return
      }
      console.log('values', { address: value.value })
    }

    const onReset = () => {
      value.value = []
      error.value = ''
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <form onSubmit={onSubmit}>
          <p>
            <CascaderInput
              placeholder="please select address"
              options={addressOptions as Option2[]}
              value={value.value}
              onChange={(nextValue) => {
                value.value = nextValue
                if (error.value) {
                  validate()
                }
              }}
            />
            <div style={{ color: '#f50' }}>{error.value || null}</div>
          </p>
          <p>
            <button type="button" onClick={onReset}>
              reset
            </button>
            &nbsp;
            <button type="submit">submit</button>
          </p>
        </form>
      </div>
    )
  },
})

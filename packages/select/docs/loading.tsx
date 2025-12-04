import { defineComponent, onMounted, ref } from 'vue'
import Select, { Option } from '../src'
import './assets/index.less'

const LoadingDemo = defineComponent({
  name: 'LoadingDemo',
  setup() {
    const loading = ref(true)
    const value = ref<string[]>(['a10'])
    const children = ref<any[]>([])

    const onChange = (val: string[], options: any) => {
      console.log('onChange', val, options)
      value.value = val
    }

    const onSelect = (...args: any[]) => {
      console.log('onSelect', args)
    }

    const loadData = () => {
      const newChildren: any[] = []
      for (let i = 10; i < 36; i += 1) {
        newChildren.push({
          key: i.toString(36) + i,
          value: i.toString(36) + i,
          disabled: i === 10,
          title: `中文${i}`,
          label: `中文${i}`,
        })
      }
      loading.value = false
      children.value = newChildren
    }

    onMounted(() => {
      setTimeout(() => {
        loadData()
      }, 2000)
    })

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>loading load data</h2>

        <div style={{ width: '300px' }}>
          <Select
            value={value.value}
            style={{ width: '500px' }}
            mode="multiple"
            loading={loading.value}
            optionFilterProp="label"
            optionLabelProp="label"
            onSelect={onSelect}
            placeholder="please select"
            onChange={onChange}
            onFocus={() => console.log('focus')}
            onBlur={(v: any) => console.log('blur', v)}
            tokenSeparators={[' ', ',']}
          >
            {children.value.map(item => (
              <Option key={item.key} value={item.value} disabled={item.disabled} title={item.title}>
                {item.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    )
  },
})

export default LoadingDemo

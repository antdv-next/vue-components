import { defineComponent, ref } from 'vue'
import Select, { Option } from '../src'
import './assets/index.less'

const ReadonlyDemo = defineComponent({
  name: 'ReadonlyDemo',
  setup() {
    const value = ref<string[]>(['jack', 'lucy'])

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Multiple Readonly Demo</h2>

        <h3>Disabled</h3>
        <Select
          mode="multiple"
          disabled
          value={value.value}
          style={{ width: '400px' }}
          placeholder="Disabled select"
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="tom">Tom</Option>
        </Select>

        <h3>Input Readonly (dropdown still works)</h3>
        <Select
          mode="multiple"
          value={value.value}
          style={{ width: '400px' }}
          placeholder="Input readonly"
          showSearch={false}
          onChange={(val: string[]) => {
            value.value = val
          }}
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="tom">Tom</Option>
        </Select>
      </div>
    )
  },
})

export default ReadonlyDemo

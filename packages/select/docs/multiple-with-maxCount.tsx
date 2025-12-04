import { defineComponent, ref } from 'vue'
import Select, { Option } from '../src'
import './assets/index.less'

const MaxCountDemo = defineComponent({
  name: 'MaxCountDemo',
  setup() {
    const value = ref<string[]>(['jack', 'lucy'])

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Multiple with MaxCount Demo</h2>

        <h3>MaxCount = 3</h3>
        <Select
          mode="multiple"
          value={value.value}
          style={{ width: '400px' }}
          placeholder="Max 3 items"
          maxCount={3}
          onChange={(val: string[]) => {
            value.value = val
          }}
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="tom">Tom</Option>
          <Option value="jerry">Jerry</Option>
          <Option value="john">John</Option>
        </Select>

        <p>
          Selected:
          {value.value.join(', ')}
        </p>
      </div>
    )
  },
})

export default MaxCountDemo

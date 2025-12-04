import { defineComponent, ref } from 'vue'
import Select, { Option } from '../src'
import './assets/index.less'

const CustomIconDemo = defineComponent({
  name: 'CustomIconDemo',
  setup() {
    const value = ref<string>()

    const customSuffixIcon = () => (
      <span style={{ color: 'red' }}>▼</span>
    )

    const customClearIcon = () => (
      <span style={{ color: 'blue' }}>✕</span>
    )

    const customRemoveIcon = () => (
      <span style={{ color: 'green' }}>×</span>
    )

    const customMenuItemSelectedIcon = () => (
      <span style={{ color: 'orange' }}>✔</span>
    )

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Custom Icon Demo</h2>

        <h3>Custom Suffix Icon</h3>
        <Select
          value={value.value}
          style={{ width: '300px' }}
          placeholder="Custom suffix icon"
          suffixIcon={customSuffixIcon()}
          onChange={(val: string) => {
            value.value = val
          }}
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="tom">Tom</Option>
        </Select>

        <h3>Custom Clear Icon</h3>
        <Select
          allowClear
          style={{ width: '300px' }}
          placeholder="Custom clear icon"
          clearIcon={customClearIcon()}
          defaultValue="jack"
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="tom">Tom</Option>
        </Select>

        <h3>Custom Remove Icon (Multiple)</h3>
        <Select
          mode="multiple"
          style={{ width: '300px' }}
          placeholder="Custom remove icon"
          removeIcon={customRemoveIcon()}
          defaultValue={['jack', 'lucy']}
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="tom">Tom</Option>
        </Select>

        <h3>Custom Menu Item Selected Icon</h3>
        <Select
          mode="multiple"
          style={{ width: '300px' }}
          placeholder="Custom selected icon"
          menuItemSelectedIcon={customMenuItemSelectedIcon()}
          defaultValue={['jack']}
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="tom">Tom</Option>
        </Select>
      </div>
    )
  },
})

export default CustomIconDemo

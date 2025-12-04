import { defineComponent, ref } from 'vue'
import Select from '../src'
import './assets/index.less'

const OptionRenderDemo = defineComponent({
  name: 'OptionRenderDemo',
  setup() {
    const value = ref<string>()

    const options = [
      { value: 'jack', label: 'Jack', age: 20, email: 'jack@example.com' },
      { value: 'lucy', label: 'Lucy', age: 25, email: 'lucy@example.com' },
      { value: 'tom', label: 'Tom', age: 30, email: 'tom@example.com' },
    ]

    const optionRender = (option: any) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          <strong>{option.data.label}</strong>
          <span style={{ marginLeft: '8px', color: '#999' }}>
            Age:
            {option.data.age}
          </span>
        </span>
        <span style={{ color: '#666', fontSize: '12px' }}>{option.data.email}</span>
      </div>
    )

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Option Render Demo</h2>

        <Select
          value={value.value}
          style={{ width: '400px' }}
          placeholder="Select with custom option render"
          optionRender={optionRender}
          onChange={(val: string) => {
            value.value = val
          }}
          options={options}
        />
      </div>
    )
  },
})

export default OptionRenderDemo

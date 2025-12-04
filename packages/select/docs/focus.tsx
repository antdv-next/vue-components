import { defineComponent, ref } from 'vue'
import Select, { Option } from '../src'
import './assets/index.less'

const FocusDemo = defineComponent({
  name: 'FocusDemo',
  setup() {
    const selectRef = ref<any>()
    const value = ref<string>()

    const focusSelect = () => {
      selectRef.value?.focus()
    }

    const blurSelect = () => {
      selectRef.value?.blur()
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Focus Demo</h2>

        <p>
          <button type="button" onClick={focusSelect}>
            Focus Select
          </button>
          <button type="button" onClick={blurSelect}>
            Blur Select
          </button>
        </p>

        <Select
          ref={selectRef}
          value={value.value}
          style={{ width: '300px' }}
          placeholder="Select a value"
          onChange={(val: string) => {
            value.value = val
          }}
          onFocus={() => console.log('focused')}
          onBlur={() => console.log('blurred')}
        >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="tom">Tom</Option>
        </Select>
      </div>
    )
  },
})

export default FocusDemo

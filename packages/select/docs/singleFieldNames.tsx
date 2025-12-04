import { defineComponent, ref } from 'vue'
import Select from '../src'
import './assets/index.less'

const FieldNamesDemo = defineComponent({
  name: 'FieldNamesDemo',
  setup() {
    const value = ref<number>()

    // Custom field names for options
    const options = [
      { id: 1, name: 'Jack', desc: 'Jack is a developer' },
      { id: 2, name: 'Lucy', desc: 'Lucy is a designer' },
      { id: 3, name: 'Tom', desc: 'Tom is a manager' },
    ]

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Field Names Demo</h2>
        <p>Use custom field names: id for value, name for label</p>

        <Select
          value={value.value}
          style={{ width: '300px' }}
          placeholder="Select with field names"
          fieldNames={{ value: 'id', label: 'name' }}
          onChange={(val: number) => {
            value.value = val
          }}
          options={options}
        />
      </div>
    )
  },
})

export default FieldNamesDemo

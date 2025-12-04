import { defineComponent, ref } from 'vue'
import Select from '../src'
import './assets/index.less'

const options = [
  { value: 'jack', label: 'Jack' },
  { value: 'lucy', label: 'Lucy' },
  { value: 'tom', label: 'Tom' },
  { value: 'jerry', label: 'Jerry' },
  { value: 'john', label: 'John' },
]

const FilterSortDemo = defineComponent({
  name: 'FilterSortDemo',
  setup() {
    const value = ref<string>()

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Filter Sort Demo</h2>

        <h3>Default filter (by value)</h3>
        <Select
          showSearch
          value={value.value}
          style={{ width: '300px' }}
          placeholder="Search to select"
          optionFilterProp="label"
          onChange={(val: string) => {
            value.value = val
          }}
          options={options}
        />

        <h3>Custom filter</h3>
        <Select
          showSearch
          style={{ width: '300px' }}
          placeholder="Custom filter"
          filterOption={(input: string, option: any) => {
            return (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }}
          options={options}
        />

        <h3>Filter with sort</h3>
        <Select
          showSearch
          style={{ width: '300px' }}
          placeholder="Filter with sort"
          optionFilterProp="label"
          filterSort={(optionA: any, optionB: any) => {
            return (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
          }}
          options={options}
        />
      </div>
    )
  },
})

export default FilterSortDemo

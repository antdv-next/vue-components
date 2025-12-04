import { defineComponent, ref } from 'vue'
import Select from '../src'
import './assets/index.less'

const SuggestDemo = defineComponent({
  name: 'SuggestDemo',
  setup() {
    const value = ref<string>('')
    const options = ref<{ value: string, label: string }[]>([])
    const loading = ref(false)

    let timeout: ReturnType<typeof setTimeout> | null = null

    const mockSearch = (text: string) => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }

      if (!text) {
        options.value = []
        return
      }

      loading.value = true

      timeout = setTimeout(() => {
        // Simulate API call
        options.value = [
          { value: `${text}_1`, label: `${text} - Option 1` },
          { value: `${text}_2`, label: `${text} - Option 2` },
          { value: `${text}_3`, label: `${text} - Option 3` },
        ]
        loading.value = false
      }, 500)
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Search Suggest Demo</h2>

        <Select
          showSearch
          value={value.value}
          style={{ width: '300px' }}
          placeholder="Type to search"
          filterOption={false}
          loading={loading.value}
          onSearch={mockSearch}
          onChange={(val: string) => {
            value.value = val
          }}
          options={options.value}
          notFoundContent={loading.value ? 'Loading...' : 'No data'}
        />
      </div>
    )
  },
})

export default SuggestDemo

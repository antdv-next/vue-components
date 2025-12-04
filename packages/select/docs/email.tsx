import { defineComponent, ref } from 'vue'
import Select from '../src'
import './assets/index.less'

const EmailDemo = defineComponent({
  name: 'EmailDemo',
  setup() {
    const value = ref<string>('')
    const options = ref<{ value: string }[]>([])

    const onSearch = (text: string) => {
      let newOptions: { value: string }[] = []
      if (!text || text.includes('@')) {
        newOptions = []
      }
      else {
        newOptions = ['gmail.com', '163.com', 'qq.com'].map(domain => ({
          value: `${text}@${domain}`,
        }))
      }
      options.value = newOptions
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Email Suggest Demo</h2>

        <Select
          mode="combobox"
          value={value.value}
          style={{ width: '300px' }}
          placeholder="Enter email"
          filterOption={false}
          onSearch={onSearch}
          onChange={(val: string) => {
            value.value = val
          }}
          options={options.value}
        />
      </div>
    )
  },
})

export default EmailDemo

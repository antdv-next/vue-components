import { defineComponent, ref } from 'vue'
import Select, { Option } from '../src'
import './assets/index.less'

const ComboboxDemo = defineComponent({
  name: 'ComboboxDemo',
  setup() {
    const disabled = ref(false)
    const value = ref('')
    const asyncOptions = ref<{ value: string }[]>([])

    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const onActive = (val: any) => {
      console.log('onActive', val)
    }

    const onChange = (val: any, option: any) => {
      console.log('onChange', val, option)
      value.value = val
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.keyCode === 13) {
        console.log('onEnter', value.value)
      }
    }

    const onSelect = (v: any, option: any) => {
      console.log('onSelect', v, option)
    }

    const onSearch = (text: string) => {
      console.log('onSearch:', text)
    }

    const onAsyncChange = (val: any) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      asyncOptions.value = []

      timeoutId = setTimeout(() => {
        asyncOptions.value = [{ value: val }, { value: `${val}-${val}` }]
      }, 1000)
    }

    const toggleDisabled = () => {
      disabled.value = !disabled.value
    }

    const reset = () => {
      value.value = ''
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>combobox</h2>
        <p>
          <button type="button" onClick={toggleDisabled}>
            toggle disabled
          </button>
          <button type="button" onClick={reset}>
            reset
          </button>
        </p>

        <Select
          value={value.value}
          mode="combobox"
          onChange={onChange}
          onActive={onActive}
          filterOption={(inputValue: string, option: any) => {
            if (!inputValue) {
              return true
            }
            return (option.value as string).includes(inputValue)
          }}
        >
          {['1', '2', '3'].map(i => (
            <Option value={i} key={i}>
              {i}
            </Option>
          ))}
        </Select>

        <div>
          <Select
            disabled={disabled.value}
            style={{ width: '500px' }}
            onChange={onChange}
            onSelect={onSelect}
            onSearch={onSearch}
            onInputKeyDown={onKeyDown}
            notFoundContent=""
            allowClear
            placeholder="please input, max len: 10"
            value={value.value}
            maxLength={10}
            mode="combobox"
            backfill
            onFocus={() => console.log('focus')}
            onBlur={() => console.log('blur')}
          >
            <Option value="jack">
              <b style={{ color: 'red' }}>jack</b>
            </Option>
            <Option value="lucy">lucy</Option>
            <Option value="disabled" disabled>
              disabled
            </Option>
            <Option value="yiminghe">yiminghe</Option>
            <Option value="竹林星光">竹林星光</Option>
          </Select>

          <h3>Async Input Element</h3>
          <Select
            mode="combobox"
            notFoundContent={null}
            style={{ width: '200px' }}
            options={asyncOptions.value}
            onChange={onAsyncChange}
          />
        </div>
      </div>
    )
  },
})

export default ComboboxDemo

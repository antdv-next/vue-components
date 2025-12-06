import { defineComponent, ref } from 'vue'
import Select, { Option } from '../src'
import './assets/index.less'

const children: any[] = []
for (let i = 10; i < 100000; i += 1) {
  children.push({
    key: i.toString(36) + i,
    value: i.toString(36) + i,
    disabled: i === 10,
    title: `中文${i}`,
    label: `中文${i}`,
  })
}

const MultipleDemo = defineComponent({
  name: 'MultipleDemo',
  setup() {
    const useAnim = ref(false)
    const loading = ref(false)
    const value = ref<string[]>(['a10'])
    const searchValue = ref('')
    const suffixIcon = ref<any>(null)

    const onChange = (val: string[], options: any) => {
      console.log('onChange', val, options)
      value.value = val
    }

    const onSelect = (...args: any[]) => {
      console.log('onSelect', args)
    }

    const onDeselect = (...args: any[]) => {
      console.log('onDeselect', args)
    }

    const toggleAnim = (e: Event) => {
      useAnim.value = (e.target as HTMLInputElement).checked
    }

    const toggleArrow = (e: Event) => {
      suffixIcon.value = (e.target as HTMLInputElement).checked ? <div>arrow</div> : null
    }

    const toggleLoading = (e: Event) => {
      loading.value = (e.target as HTMLInputElement).checked
    }

    const setSearchValue = (val: string) => {
      searchValue.value = val
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>multiple select（scroll the menu）</h2>

        <p>
          <label>
            anim
            <input checked={useAnim.value} type="checkbox" onChange={toggleAnim} />
          </label>
        </p>
        <p>
          <label>
            showArrow
            <input checked={!!suffixIcon.value} type="checkbox" onChange={toggleArrow} />
          </label>
        </p>
        <p>
          <label>
            loading
            <input checked={loading.value} type="checkbox" onChange={toggleLoading} />
          </label>
        </p>

        <div style={{ width: '100%' }}>
          <Select
            autoFocus
            value={value.value}
            animation={useAnim.value ? 'slide-up' : undefined}
            style={{ width: '100%' }}
            mode="multiple"
            loading={loading.value}
            suffix={suffixIcon.value}
            allowClear
            optionFilterProp="label"
            optionLabelProp="label"
            onSelect={onSelect}
            onDeselect={onDeselect}
            placeholder="please select"
            onChange={onChange}
            onFocus={() => console.log('focus')}
            onBlur={(v: any) => console.log('blur', v)}
            tokenSeparators={[' ', ',']}
          >
            {children.map(item => (
              <Option key={item.key} value={item.value} disabled={item.disabled} title={item.title}>
                {item.label}
              </Option>
            ))}
          </Select>
        </div>

        <h2>multiple select with autoClearSearchValue = false</h2>
        <div style={{ width: '300px' }}>
          <Select
            value={value.value}
            style={{ width: '500px' }}
            mode="multiple"
            autoClearSearchValue={false}
            showSearch
            searchValue={searchValue.value}
            onSearch={setSearchValue}
            optionFilterProp="label"
            optionLabelProp="label"
            onSelect={onSelect}
            onDeselect={onDeselect}
            placeholder="please select"
            onChange={onChange}
            onFocus={() => console.log('focus')}
            onBlur={(v: any) => console.log('blur', v)}
            tokenSeparators={[' ', ',']}
          >
            {children.map(item => (
              <Option key={item.key} value={item.value} disabled={item.disabled} title={item.title}>
                {item.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    )
  },
})

export default MultipleDemo

import { defineComponent, ref } from 'vue'
import Select, { Option } from '../src'
import './assets/index.less'

const children: any[] = []
for (let i = 10; i < 36; i += 1) {
  children.push({
    key: i.toString(36) + i,
    value: i.toString(36) + i,
    label: i.toString(36) + i,
  })
}

const TagsDemo = defineComponent({
  name: 'TagsDemo',
  setup() {
    const disabled = ref(false)
    const value = ref<string[]>([
      'name1',
      'name2',
      'name3',
      'name4',
      'name5',
      'a10',
      'b11',
      'c12',
      'd13',
    ])
    const maxTagCount = ref<number | 'responsive'>('responsive')

    const toggleMaxTagCount = (count: number | 'responsive' | null) => {
      maxTagCount.value = count as any
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>tags select（scroll the menu）</h2>

        <div>
          <Select
            placeholder="placeholder"
            mode="tags"
            style={{ width: '400px' }}
            disabled={disabled.value}
            maxTagCount={maxTagCount.value}
            maxTagTextLength={10}
            value={value.value}
            onChange={(val: string[], option: any) => {
              console.log('change:', val, option)
              value.value = val
            }}
            onSelect={(val: any, option: any) => {
              console.log('selected', val, option)
            }}
            onDeselect={(val: any, option: any) => {
              console.log('deselected', val, option)
            }}
            tokenSeparators={[' ', ',', '\n']}
            onFocus={() => console.log('focus')}
            onBlur={() => console.log('blur')}
          >
            {children.map(item => (
              <Option key={item.key} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </div>

        <p>
          <button type="button" onClick={() => (disabled.value = !disabled.value)}>
            toggle disabled
          </button>
          <button type="button" onClick={() => toggleMaxTagCount(0)}>
            toggle maxTagCount (0)
          </button>
          <button type="button" onClick={() => toggleMaxTagCount(1)}>
            toggle maxTagCount (1)
          </button>
          <button type="button" onClick={() => toggleMaxTagCount(null)}>
            toggle maxTagCount (null)
          </button>
          <button type="button" onClick={() => toggleMaxTagCount('responsive')}>
            toggle maxTagCount (responsive)
          </button>
        </p>

        <h2>tags select with open = false</h2>
        <div>
          <Select
            placeholder="placeholder"
            mode="tags"
            style={{ width: '500px' }}
            disabled={disabled.value}
            maxTagCount={maxTagCount.value}
            maxTagTextLength={10}
            value={value.value}
            onChange={(val: string[], option: any) => {
              console.log('change:', val, option)
              value.value = val
            }}
            onSelect={(val: any, option: any) => {
              console.log('selected', val, option)
            }}
            onDeselect={(val: any, option: any) => {
              console.log('deselected', val, option)
            }}
            tokenSeparators={[' ', ',']}
            onFocus={() => console.log('focus')}
            onBlur={() => console.log('blur')}
            open={false}
          >
            {children.map(item => (
              <Option key={item.key} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    )
  },
})

export default TagsDemo

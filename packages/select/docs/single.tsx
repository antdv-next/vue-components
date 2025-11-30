import { defineComponent, ref } from 'vue'
import Select, { Option } from '../src'
import './assets/index.less'
import './single.less'

const SingleDemo = defineComponent({
  name: 'SingleDemo',
  setup() {
    const destroy = ref(false)
    const value = ref<string | null>('9')

    const onChange = (val: string | null) => {
      console.log('onChange', val)
      value.value = val
    }

    const onDestroy = () => {
      destroy.value = true
    }

    const onBlur = (v: any) => {
      console.log('onBlur', v)
    }

    const onFocus = () => {
      console.log('onFocus')
    }

    const onSearch = (val: string) => {
      console.log('Search:', val)
    }

    return () => {
      if (destroy.value) {
        return null
      }

      return (
        <div style={{ margin: '20px' }}>
          <div
            style={{ height: '150px', background: 'rgba(0, 255, 0, 0.1)' }}
            onMousedown={(e: MouseEvent) => {
              e.preventDefault()
            }}
          >
            Prevent Default
          </div>

          <h2>Single Select</h2>

          <div>
            <Select
              autoFocus
              id="my-select"
              value={value.value}
              placeholder="placeholder"
              showSearch
              onBlur={onBlur}
              onFocus={onFocus}
              onSearch={onSearch}
              allowClear
              optionFilterProp="text"
              onChange={onChange}
              onPopupScroll={() => {
                console.log('Scroll!')
              }}
            >
              <Option value={null} children="不选择" />
              <Option value="01" text="jack" title="jack" children={<b style={{ color: 'red' }}>jack</b>} />
              <Option value="11" text="lucy" children="lucy" />
              <Option value="21" disabled text="disabled" children="disabled" />
              <Option
                value="31"
                text="yiminghe"
                class="test-option"
                style={{ background: 'yellow' }}
                children="yiminghe"
              />
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <Option key={i} value={String(i)} text={String(i)} children={`${i}-text`} />
              ))}
            </Select>
          </div>

          <h2>native select</h2>
          <select
            value={value.value ?? ''}
            style={{ width: '500px' }}
            onChange={(e: Event) => onChange((e.target as HTMLSelectElement).value)}
          >
            <option value="01">jack</option>
            <option value="11">lucy</option>
            <option value="21" disabled>
              disabled
            </option>
            <option value="31">yiminghe</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <option value={i} key={i}>
                {i}
              </option>
            ))}
          </select>

          <h2>RTL Select</h2>

          <div style={{ width: '300px' }}>
            <Select
              id="my-select-rtl"
              placeholder="rtl"
              direction="rtl"
              popupMatchSelectWidth={300}
              popupStyle={{ minWidth: '300px' }}
              style={{ width: '500px' }}
            >
              <Option value="1" children="1" />
              <Option value="2" children="2" />
            </Select>
          </div>

          <p>
            <button type="button" onClick={onDestroy}>
              destroy
            </button>
          </p>
        </div>
      )
    }
  },
})

export default SingleDemo

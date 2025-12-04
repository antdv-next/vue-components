import { defineComponent, ref } from 'vue'
import Select, { Option } from '../src'
import './assets/index.less'

const ControlledDemo = defineComponent({
  name: 'ControlledDemo',
  setup() {
    const destroy = ref(false)
    const value = ref<string | number>(9)
    const open = ref(true)

    const onChange = (e: any) => {
      let val
      if (e && e.target) {
        val = e.target.value
      }
      else {
        val = e
      }
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

    const onPopupVisibleChange = (visible: boolean) => {
      open.value = visible
    }

    const onActive = (val: any) => {
      console.error('onActive', val)
    }

    return () => {
      if (destroy.value) {
        return null
      }

      return (
        <div style={{ margin: '20px' }}>
          <h2>controlled Select</h2>
          <div style={{ width: '300px' }}>
            <Select
              id="my-select"
              value={value.value}
              placeholder="placeholder"
              listHeight={200}
              style={{ width: '500px' }}
              onBlur={onBlur}
              onFocus={onFocus}
              open={open.value}
              optionLabelProp="children"
              optionFilterProp="text"
              onChange={onChange}
              onPopupVisibleChange={onPopupVisibleChange}
              onActive={onActive}
            >
              <Option value="01" text="jack" title="jack">
                <b style={{ color: 'red' }}>jack</b>
              </Option>
              <Option value="11" text="lucy">
                lucy
              </Option>
              <Option value="21" disabled text="disabled">
                disabled
              </Option>
              <Option value="31" text="yiminghe">
                yiminghe
              </Option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <Option key={i} value={i} text={String(i)}>
                  {i}
                  -text
                </Option>
              ))}
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

export default ControlledDemo

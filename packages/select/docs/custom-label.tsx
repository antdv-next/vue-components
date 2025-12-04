import { defineComponent, ref } from 'vue'
import Select from '../src'
import './assets/index.less'

const CustomLabelDemo = defineComponent({
  name: 'CustomLabelDemo',
  setup() {
    const value = ref<string[]>(['jack'])

    const options = [
      {
        value: 'jack',
        label: (
          <span>
            <span role="img" aria-label="China">
              🇨🇳
            </span>
            {' '}
            Jack (China)
          </span>
        ),
        desc: 'Jack is from China',
      },
      {
        value: 'lucy',
        label: (
          <span>
            <span role="img" aria-label="USA">
              🇺🇸
            </span>
            {' '}
            Lucy (USA)
          </span>
        ),
        desc: 'Lucy is from USA',
      },
      {
        value: 'tom',
        label: (
          <span>
            <span role="img" aria-label="UK">
              🇬🇧
            </span>
            {' '}
            Tom (UK)
          </span>
        ),
        desc: 'Tom is from UK',
      },
    ]

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Custom Label Demo</h2>

        <Select
          mode="multiple"
          value={value.value}
          style={{ width: '400px' }}
          placeholder="Select with custom label"
          onChange={(val: string[]) => {
            value.value = val
          }}
          optionLabelProp="label"
          options={options}
        />
      </div>
    )
  },
})

export default CustomLabelDemo

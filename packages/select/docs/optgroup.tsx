import { defineComponent } from 'vue'
import Select from '../src'
import './assets/index.less'

const OptGroupDemo = defineComponent({
  name: 'OptGroupDemo',
  setup() {
    const onChange = (value: any, option: any) => {
      console.log(`selected ${value}`, option)
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Select OptGroup</h2>
        <div style={{ width: '300px' }}>
          <Select
            placeholder="placeholder"
            defaultValue="lucy"
            style={{ width: '500px' }}
            onChange={onChange}
            options={[
              {
                label: 'manager',
                className: 'group-custom-className',
                title: 'group-custom-class',
                options: [
                  {
                    label: 'jack',
                    value: 'jack',
                    className: 'jackClass1 jackClass2',
                    title: 'jack-custom-Title',
                  },
                  { label: 'lucy', value: 'lucy' },
                ],
              },
              {
                label: 'engineer',
                options: [{ label: 'yiminghe', value: 'yiminghe' }],
              },
              {
                label: 'bamboo',
                options: undefined,
              },
              {
                label: 'mocha',
                options: null,
              },
            ]}
          />
        </div>
      </div>
    )
  },
})

export default OptGroupDemo

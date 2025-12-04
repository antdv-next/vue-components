import { defineComponent, ref } from 'vue'
import Select, { Option } from '../src'
import './assets/index.less'

const CustomTagsDemo = defineComponent({
  name: 'CustomTagsDemo',
  setup() {
    const value = ref<string[]>(['gold', 'cyan'])

    const tagColors: Record<string, string> = {
      gold: '#f5a623',
      cyan: '#13c2c2',
      green: '#52c41a',
      lime: '#a0d911',
      magenta: '#eb2f96',
    }

    const tagRender = (props: {
      label: any
      value: string
      closable: boolean
      onClose: () => void
    }) => {
      const { label, value: val, closable, onClose } = props
      const color = tagColors[val] || '#999'

      return (
        <span
          style={{
            backgroundColor: color,
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '4px',
            marginRight: '4px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {label}
          {closable && (
            <span
              style={{ marginLeft: '4px', cursor: 'pointer' }}
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                onClose()
              }}
            >
              ×
            </span>
          )}
        </span>
      )
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Custom Tags Demo</h2>

        <Select
          mode="multiple"
          value={value.value}
          style={{ width: '400px' }}
          placeholder="Select colors"
          tagRender={tagRender}
          onChange={(val: string[]) => {
            value.value = val
          }}
        >
          <Option value="gold">Gold</Option>
          <Option value="cyan">Cyan</Option>
          <Option value="green">Green</Option>
          <Option value="lime">Lime</Option>
          <Option value="magenta">Magenta</Option>
        </Select>
      </div>
    )
  },
})

export default CustomTagsDemo

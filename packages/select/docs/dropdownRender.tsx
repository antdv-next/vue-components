import { defineComponent, ref } from 'vue'
import Select from '../src'
import './assets/index.less'

const DropdownRenderDemo = defineComponent({
  name: 'DropdownRenderDemo',
  setup() {
    const value = ref<string>()
    const items = ref(['jack', 'lucy', 'tom'])
    const newItem = ref('')

    const addItem = () => {
      if (newItem.value && !items.value.includes(newItem.value)) {
        items.value = [...items.value, newItem.value]
        newItem.value = ''
      }
    }

    const dropdownRender = (menu: any) => (
      <div>
        {menu}
        <div style={{ display: 'flex', padding: '8px', borderTop: '1px solid #e8e8e8' }}>
          <input
            type="text"
            value={newItem.value}
            onInput={(e: Event) => {
              newItem.value = (e.target as HTMLInputElement).value
            }}
            placeholder="Add item"
            style={{ flex: 1, marginRight: '8px', padding: '4px' }}
          />
          <button type="button" onClick={addItem}>
            + Add
          </button>
        </div>
      </div>
    )

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>Dropdown Render Demo</h2>

        <Select
          value={value.value}
          style={{ width: '300px' }}
          placeholder="Select or add item"
          dropdownRender={dropdownRender}
          onChange={(val: string) => {
            value.value = val
          }}
          options={items.value.map(item => ({ value: item, label: item }))}
        />
      </div>
    )
  },
})

export default DropdownRenderDemo

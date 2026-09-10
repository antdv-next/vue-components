import Menu, { Divider, Item as MenuItem } from '@v-c/menu'
import { defineComponent, ref } from 'vue'
import Dropdown from '../src'

export default defineComponent(() => {
  const open = ref(false)
  let selectedKeys: string[] = []

  const onOpenChange = (nextOpen: boolean) => {
    console.log('open', nextOpen)
    open.value = nextOpen
  }

  const saveSelected = ({ selectedKeys: keys }: { selectedKeys: string[] }) => {
    selectedKeys = keys
  }

  const confirm = () => {
    console.log(selectedKeys)
    open.value = false
  }

  const dropdownAttrs = { closeOnSelect: false } as any

  return () => {
    const menu = (
      <Menu
        style={{ width: '140px' }}
        multiple
        onSelect={saveSelected}
        onDeselect={saveSelected}
      >
        <MenuItem key="1">one</MenuItem>
        <MenuItem key="2">two</MenuItem>
        <Divider />
        <MenuItem disabled>
          <button
            style={{
              cursor: 'pointer',
              color: '#000',
              pointerEvents: 'visible',
            }}
            onClick={confirm}
          >
            确定
          </button>
        </MenuItem>
      </Menu>
    )

    return (
      <Dropdown
        {...dropdownAttrs}
        trigger={['click']}
        onOpenChange={onOpenChange}
        open={open.value}
        overlay={menu}
        animation="slide-up"
      >
        <button>open</button>
      </Dropdown>
    )
  }
})

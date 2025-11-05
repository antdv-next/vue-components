import Menu, { Item as MenuItem } from '@v-c/menu'
import { defineComponent } from 'vue'
import Dropdown from '../src'

const menu = (
  <Menu style={{ width: '140px' }}>
    <MenuItem key="1">one</MenuItem>
    <MenuItem key="2">two</MenuItem>
  </Menu>
)

export default defineComponent(() => {
  return () => (
    <Dropdown
      trigger={['contextMenu']}
      overlay={menu}
      animation="slide-up"
      alignPoint
    >
      <div
        role="button"
        style={{
          border: '1px solid #000',
          padding: '100px 0',
          textAlign: 'center',
        }}
      >
        Right click me!
      </div>
    </Dropdown>
  )
})

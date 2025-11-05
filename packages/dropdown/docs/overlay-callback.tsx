import Menu, { Divider, Item as MenuItem } from '@v-c/menu'
import { defineComponent } from 'vue'
import Dropdown from '../src'

const onSelect = ({ key }: { key: string }) => {
  console.log(`${key} selected`)
}

const onVisibleChange = (visible: boolean) => {
  console.log(visible)
}

const menuCallback = () => (
  <Menu onSelect={onSelect}>
    <MenuItem disabled>disabled</MenuItem>
    <MenuItem key="1">one</MenuItem>
    <Divider />
    <MenuItem key="2">two</MenuItem>
  </Menu>
)

export default defineComponent(() => {
  return () => (
    <div style={{ margin: '20px' }}>
      <div style={{ height: '100px' }} />
      <div>
        <Dropdown
          trigger={['click']}
          overlay={menuCallback}
          animation="slide-up"
          onVisibleChange={onVisibleChange}
        >
          <button style={{ width: '100px' }}>open</button>
        </Dropdown>
      </div>
    </div>
  )
})

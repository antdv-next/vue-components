import Menu, { Item as MenuItem } from '@v-c/menu'
import { defineComponent, ref } from 'vue'
import Dropdown from '../src'

export default defineComponent(() => {
  const longList = ref(false)

  const makeLong = () => {
    longList.value = true
  }

  const makeShort = () => {
    longList.value = false
  }

  return () => {
    const menuItems = [
      <MenuItem key="1">1st item</MenuItem>,
      <MenuItem key="2">2nd item</MenuItem>,
    ]

    if (longList.value) {
      menuItems.push(<MenuItem key="3">3rd LONG SUPER LONG item</MenuItem>)
    }

    const menu = <Menu>{menuItems}</Menu>

    return (
      <div>
        <Dropdown overlay={menu}>
          <button>Actions</button>
        </Dropdown>
        <button onClick={makeLong} style={{ marginLeft: '8px' }}>
          Long List
        </button>
        <button onClick={makeShort} style={{ marginLeft: '8px' }}>
          Short List
        </button>
      </div>
    )
  }
})

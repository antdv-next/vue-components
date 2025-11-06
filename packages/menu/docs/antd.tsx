import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { MenuProps } from '../src'
import { defineComponent, ref } from 'vue'
import Menu, { Divider, Item as MenuItem, SubMenu } from '../src'
import './assets/index.less'

type MenuMode = 'horizontal' | 'vertical' | 'inline'

function handleClick(info: any) {
  console.log(`clicked ${info.key}`)
  console.log(info)
}

const horizontalMotion: CSSMotionProps = {
  name: 'rc-menu-open-slide-up',
  appear: true,
  css: true,
}

const verticalMotion: CSSMotionProps = {
  name: 'rc-menu-open-zoom',
  appear: true,
  css: true,
}

export const inlineMotion: CSSMotionProps = {
  name: 'rc-menu-collapse',
  appear: true,
  css: true,
}

const motionMap: Partial<Record<MenuMode | 'other', CSSMotionProps>> = {
  horizontal: horizontalMotion,
  inline: inlineMotion,
  vertical: verticalMotion,
}

const nestSubMenu = (
  <SubMenu
    title={<span class="submenu-title-wrapper">offset sub menu 2</span>}
    key="4"
    popupOffset={[10, 15]}
  >
    <MenuItem key="4-1">inner inner</MenuItem>
    <Divider />
    <SubMenu key="4-2" title={<span class="submenu-title-wrapper">sub menu 1</span>}>
      <SubMenu title={<span class="submenu-title-wrapper">sub 4-2-0</span>} key="4-2-0">
        <MenuItem key="4-2-0-1">inner inner</MenuItem>
        <MenuItem key="4-2-0-2">inner inner2</MenuItem>
      </SubMenu>
      <MenuItem key="4-2-1">inn</MenuItem>
      <SubMenu title={<span class="submenu-title-wrapper">sub menu 4</span>} key="4-2-2">
        <MenuItem key="4-2-2-1">inner inner</MenuItem>
        <MenuItem key="4-2-2-2">inner inner2</MenuItem>
      </SubMenu>
      <SubMenu title={<span class="submenu-title-wrapper">sub menu 3</span>} key="4-2-3">
        <MenuItem key="4-2-3-1">inner inner</MenuItem>
        <MenuItem key="4-2-3-2">inner inner2</MenuItem>
      </SubMenu>
    </SubMenu>
  </SubMenu>
)

function onOpenChange(value: any) {
  console.log('onOpenChange', value)
}

const children1 = [
  <SubMenu title={<span class="submenu-title-wrapper">sub menu</span>} key="1">
    <MenuItem key="1-1">0-1</MenuItem>
    <MenuItem key="1-2">0-2</MenuItem>
  </SubMenu>,
  nestSubMenu,
  <MenuItem key="2">1</MenuItem>,
  <MenuItem key="3">outer</MenuItem>,
  <MenuItem key="5" disabled>
    disabled
  </MenuItem>,
  <MenuItem key="6">outer3</MenuItem>,
]

const children2 = [
  <SubMenu title={<span class="submenu-title-wrapper">sub menu</span>} key="1">
    <MenuItem key="1-1">0-1</MenuItem>
    <MenuItem key="1-2">0-2</MenuItem>
  </SubMenu>,
  <MenuItem key="2">1</MenuItem>,
  <MenuItem key="3">outer</MenuItem>,
]

const customizeIndicator = <span>Add More Items</span>

const CommonMenu = defineComponent({
  props: {
    mode: String as () => MenuProps['mode'],
    defaultMotions: Object as () => Partial<Record<MenuMode | 'other', CSSMotionProps>>,
    motion: Object as () => CSSMotionProps,
    triggerSubMenuAction: String as () => MenuProps['triggerSubMenuAction'],
    updateChildrenAndOverflowedIndicator: Boolean,
    defaultOpenKeys: Array as () => string[],
  },
  setup(props) {
    const children = ref(children1)
    const overflowedIndicator = ref<any>(undefined)

    const toggleChildren = () => {
      children.value = children.value === children1 ? children2 : children1
    }

    const toggleOverflowedIndicator = () => {
      overflowedIndicator.value = overflowedIndicator.value === undefined ? customizeIndicator : undefined
    }

    return () => (
      <div>
        {props.updateChildrenAndOverflowedIndicator && (
          <div>
            <button type="button" onClick={toggleChildren}>
              toggle children
            </button>
            <button type="button" onClick={toggleOverflowedIndicator}>
              toggle overflowedIndicator
            </button>
          </div>
        )}
        <Menu
          onClick={handleClick}
          triggerSubMenuAction={props.triggerSubMenuAction}
          onOpenChange={onOpenChange}
          selectedKeys={['3']}
          overflowedIndicator={overflowedIndicator.value}
          mode={props.mode}
          defaultMotions={props.defaultMotions}
          motion={props.motion}
          defaultOpenKeys={props.defaultOpenKeys}
        >
          {children.value}
        </Menu>
      </div>
    )
  },
})

export default defineComponent({
  setup() {
    return () => (
      <div style={{ margin: '20px' }}>
        <h2>antd menu</h2>
        <div>
          <h3>horizontal</h3>

          <div style={{ margin: '20px' }}>
            <CommonMenu
              mode="horizontal"
              defaultMotions={motionMap}
            />
          </div>

          <h3>horizontal and click</h3>

          <div style={{ margin: '20px' }}>
            {/* <CommonMenu */}
            {/*  mode="horizontal" */}
            {/*  defaultMotions={motionMap} */}
            {/*  triggerSubMenuAction="click" */}
            {/*  updateChildrenAndOverflowedIndicator */}
            {/* /> */}
          </div>

          <h3>vertical</h3>

          <div style={{ margin: '20px', width: '200px' }}>
            {/* <CommonMenu mode="vertical" defaultMotions={motionMap} /> */}
          </div>

          <h3>inline</h3>

          <div style={{ margin: '20px', width: '400px' }}>
            {/* <CommonMenu mode="inline" defaultOpenKeys={['1']} motion={inlineMotion} /> */}
          </div>
        </div>
      </div>
    )
  },
})

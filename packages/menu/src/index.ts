import Menu from './Menu'
import MenuItem from './MenuItem'
import SubMenu from './SubMenu'
import MenuItemGroup from './MenuItemGroup'
import Divider from './Divider'
import { useFullPath } from './context/PathContext'

export type { MenuProps, MenuRef, MenuItemProps, SubMenuProps, MenuItemGroupProps } from './interface'

export {
  SubMenu,
  MenuItem as Item,
  MenuItem,
  MenuItemGroup,
  MenuItemGroup as ItemGroup,
  Divider,
  useFullPath,
}

type MenuType = typeof Menu & {
  Item: typeof MenuItem
  SubMenu: typeof SubMenu
  ItemGroup: typeof MenuItemGroup
  Divider: typeof Divider
}

const ExportMenu = Menu as MenuType
ExportMenu.Item = MenuItem
ExportMenu.SubMenu = SubMenu
ExportMenu.ItemGroup = MenuItemGroup
ExportMenu.Divider = Divider

export default ExportMenu

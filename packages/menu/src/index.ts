import type { MenuRef } from './interface'
import type { MenuProps } from './Menu'
import type { MenuItemProps } from './MenuItem'
import type { MenuItemGroupProps } from './MenuItemGroup'
import type { SubMenuProps } from './SubMenu'
import { useFullPath } from './context/PathContext'
import Divider from './Divider'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemGroup from './MenuItemGroup'
import SubMenu from './SubMenu'

export {
  Divider,
  MenuItem as Item,
  MenuItemGroup as ItemGroup,
  MenuItem,
  MenuItemGroup,
  SubMenu,
  /** @private Only used for antd internal. Do not use in your production. */
  useFullPath,
}

export type {
  MenuItemGroupProps,
  MenuItemProps,
  MenuProps,
  MenuRef,
  SubMenuProps,
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

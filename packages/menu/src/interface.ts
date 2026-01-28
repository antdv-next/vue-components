import type { Key, VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { SubMenuProps } from './SubMenu'

// ========================= Options =========================
interface ItemSharedProps {
  // ref?: React.Ref<HTMLLIElement | null>
  style?: CSSProperties
  class?: string
}

export interface SubMenuType extends ItemSharedProps {
  type?: 'submenu'

  label?: VueNode

  children: ItemType[]

  disabled?: boolean

  key: string

  rootClass?: string

  // >>>>> Icon
  itemIcon?: RenderIconType
  expandIcon?: RenderIconType

  // >>>>> Active
  onMouseEnter?: MenuHoverEventHandler
  onMouseLeave?: MenuHoverEventHandler

  // >>>>> Popup
  popupClassName?: string
  popupOffset?: number[]
  popupStyle?: CSSProperties
  popupRender?: PopupRender

  // >>>>> Events
  onClick?: MenuClickEventHandler
  onTitleClick?: (info: MenuTitleInfo) => void
  onTitleMouseEnter?: MenuHoverEventHandler
  onTitleMouseLeave?: MenuHoverEventHandler
}

export interface MenuItemType extends ItemSharedProps {
  type?: 'item'

  label?: VueNode

  disabled?: boolean

  itemIcon?: RenderIconType

  extra?: VueNode

  key: Key

  // >>>>> Active
  onMouseEnter?: MenuHoverEventHandler
  onMouseLeave?: MenuHoverEventHandler

  // >>>>> Events
  onClick?: MenuClickEventHandler
}

export interface MenuItemGroupType extends ItemSharedProps {
  type: 'group'

  label?: VueNode

  children?: ItemType[]
}

export interface MenuDividerType extends ItemSharedProps {
  type: 'divider'
}

export type ItemType = SubMenuType | MenuItemType | MenuItemGroupType | MenuDividerType | null

// ========================== Basic ==========================
export type MenuMode = 'horizontal' | 'vertical' | 'inline'

export type BuiltinPlacements = Record<string, any>

export type TriggerSubMenuAction = 'click' | 'hover'

export interface RenderIconInfo {
  isSelected?: boolean
  isOpen?: boolean
  isSubMenu?: boolean
  disabled?: boolean
}

export type RenderIconType = VueNode | ((props: RenderIconInfo) => VueNode) | boolean

export interface MenuInfo {
  key: string
  keyPath: string[]
  /** @deprecated This will not support in future. You should avoid to use this */
  item: VueNode
  domEvent: MouseEvent
}

export interface MenuTitleInfo {
  key: string
  domEvent: MouseEvent
}

// ========================== Hover ==========================
export type MenuHoverEventHandler = (info: {
  key: string
  domEvent: MouseEvent
}) => void

// ======================== Selection ========================
export interface SelectInfo extends MenuInfo {
  selectedKeys: string[]
}

export type SelectEventHandler = (info: SelectInfo) => void

// ========================== Click ==========================
export type MenuClickEventHandler = (info: MenuInfo) => void

export interface MenuRef {
  /**
   * Focus active child if any, or the first child which is not disabled will be focused.
   * @param options
   */
  focus: (options?: FocusOptions) => void
  list: HTMLUListElement
  findItem: (params: { key: string }) => HTMLElement | null
}

// ======================== Component ========================
export type ComponentType = 'submenu' | 'item' | 'group' | 'divider'

export type Components = Partial<Record<ComponentType, any>>

export type PopupRender = (
  node: any,
  info: { item: SubMenuProps, keys: string[] },
) => VueNode

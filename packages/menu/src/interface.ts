import type { CSSProperties, Ref, VNode } from 'vue'
import type { SubMenuProps } from './SubMenu'

// ========================= Options =========================
interface ItemSharedProps {
  ref?: Ref<HTMLLIElement | null>
  style?: CSSProperties
  className?: string
}

export interface SubMenuType extends ItemSharedProps {
  type?: 'submenu'

  label?: VNode

  children: ItemType[]

  disabled?: boolean

  key: string

  rootClassName?: string

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

  // >>>>> Events
  onClick?: MenuClickEventHandler
  onTitleClick?: (info: MenuTitleInfo) => void
  onTitleMouseEnter?: MenuHoverEventHandler
  onTitleMouseLeave?: MenuHoverEventHandler
}

export interface MenuItemType extends ItemSharedProps {
  type?: 'item'

  label?: VNode

  disabled?: boolean

  itemIcon?: RenderIconType

  extra?: VNode

  key: string | number

  // >>>>> Active
  onMouseenter?: MenuHoverEventHandler
  onMouseleave?: MenuHoverEventHandler

  // >>>>> Events
  onClick?: MenuClickEventHandler
}

export interface MenuItemGroupType extends ItemSharedProps {
  type: 'group'

  label?: VNode

  children?: ItemType[]
}

export interface MenuDividerType extends Omit<ItemSharedProps, 'ref'> {
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

export type RenderIconType = VNode | ((props: RenderIconInfo) => VNode)

export interface MenuInfo {
  key: string
  keyPath: string[]
  /** @deprecated This will not support in future. You should avoid to use this */
  item: any
  domEvent: MouseEvent | KeyboardEvent
}

export interface MenuTitleInfo {
  key: string
  domEvent: MouseEvent | KeyboardEvent
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
  node: Element,
  info: { item: SubMenuProps, keys: string[] },
) => VNode

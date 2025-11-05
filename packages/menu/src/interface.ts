import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { VueNode } from '@v-c/util/dist/type'

export type MenuMode = 'horizontal' | 'vertical' | 'inline'

export type TriggerSubMenuAction = 'click' | 'hover'

export type BuiltinPlacements = Record<string, any>

export type ComponentType = 'submenu' | 'item' | 'group' | 'divider'
export type Components = Partial<Record<ComponentType, any>>

export type RenderIconInfo = {
  isSelected?: boolean
  isOpen?: boolean
  isSubMenu?: boolean
  disabled?: boolean
}

export type RenderIconType = VueNode | boolean | ((info: RenderIconInfo) => VueNode)

export interface MenuInfo {
  key: string
  keyPath: string[]
  item: any
  domEvent: MouseEvent | KeyboardEvent
}

export interface MenuTitleInfo {
  key: string
  domEvent: MouseEvent | KeyboardEvent
}

export type MenuHoverEventHandler = (info: {
  key: string
  domEvent: MouseEvent
}) => void

export interface SelectInfo extends MenuInfo {
  selectedKeys: string[]
}

export type MenuClickEventHandler = (info: MenuInfo) => void

export type SelectEventHandler = (info: SelectInfo) => void

export interface MenuDividerType {
  type: 'divider'
  className?: string
  style?: Record<string, any>
}

export interface MenuItemType {
  type?: 'item'
  label?: VueNode
  disabled?: boolean
  itemIcon?: RenderIconType
  extra?: VueNode
  key: string
  className?: string
  style?: Record<string, any>
  onMouseEnter?: MenuHoverEventHandler
  onMouseLeave?: MenuHoverEventHandler
  onClick?: MenuClickEventHandler
}

export interface MenuItemGroupType {
  type: 'group'
  label?: VueNode
  children?: ItemType[]
  className?: string
  style?: Record<string, any>
  key?: string
}

export interface SubMenuType {
  type?: 'submenu'
  label?: VueNode
  children: ItemType[]
  disabled?: boolean
  key: string
  className?: string
  style?: Record<string, any>
  rootClassName?: string
  itemIcon?: RenderIconType
  expandIcon?: RenderIconType
  onMouseEnter?: MenuHoverEventHandler
  onMouseLeave?: MenuHoverEventHandler
  popupClassName?: string
  popupOffset?: number[]
  popupStyle?: Record<string, any>
  onClick?: MenuClickEventHandler
  onTitleClick?: (info: MenuTitleInfo) => void
  onTitleMouseEnter?: MenuHoverEventHandler
  onTitleMouseLeave?: MenuHoverEventHandler
}

export type ItemType = MenuDividerType | MenuItemType | MenuItemGroupType | SubMenuType | null

export interface MenuProps {
  prefixCls?: string
  rootClassName?: string
  className?: string
  classNames?: Partial<Record<'list' | 'listTitle', string>>
  styles?: Partial<Record<'list' | 'listTitle', Record<string, any>>>
  id?: string
  tabIndex?: number
  style?: Record<string, any>
  items?: ItemType[]
  children?: VueNode
  direction?: 'ltr' | 'rtl'
  disabled?: boolean
  disabledOverflow?: boolean

  mode?: MenuMode
  inlineCollapsed?: boolean

  defaultOpenKeys?: string[]
  openKeys?: string[]

  activeKey?: string
  defaultActiveFirst?: boolean

  selectable?: boolean
  multiple?: boolean

  defaultSelectedKeys?: string[]
  selectedKeys?: string[]

  inlineIndent?: number

  motion?: CSSMotionProps
  defaultMotions?: Partial<Record<MenuMode | 'other', CSSMotionProps>>

  subMenuOpenDelay?: number
  subMenuCloseDelay?: number
  forceSubMenuRender?: boolean
  triggerSubMenuAction?: TriggerSubMenuAction
  builtinPlacements?: BuiltinPlacements

  itemIcon?: RenderIconType
  expandIcon?: RenderIconType
  overflowedIndicator?: VueNode
  overflowedIndicatorPopupClassName?: string

  getPopupContainer?: (node: HTMLElement) => HTMLElement

  onClick?: MenuClickEventHandler
  onOpenChange?: (openKeys: string[]) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onSelect?: SelectEventHandler
  onDeselect?: SelectEventHandler

  popupRender?: (node: VueNode, info: { item: SubMenuProps; keys: string[] }) => VueNode

  _internalRenderMenuItem?: (
    originNode: any,
    menuItemProps: any,
    stateProps: { selected: boolean },
  ) => VueNode
  _internalRenderSubMenuItem?: (
    originNode: any,
    subMenuItemProps: any,
    stateProps: {
      selected: boolean
      open: boolean
      active: boolean
      disabled: boolean
    },
  ) => VueNode
  _internalComponents?: Partial<Record<ComponentType, any>>
}

export interface MenuItemProps extends Omit<MenuItemType, 'label' | 'type'> {
  children?: VueNode
  eventKey?: string
  warnKey?: boolean
  attribute?: Record<string, string>
}

export interface MenuItemGroupProps
  extends Omit<MenuItemGroupType, 'type' | 'children' | 'label'> {
  title?: VueNode
  children?: VueNode
  eventKey?: string
  warnKey?: boolean
}

export interface MenuDividerProps extends Omit<MenuDividerType, 'type'> {}

export interface SubMenuProps extends Omit<SubMenuType, 'type' | 'children' | 'label'> {
  classNames?: Partial<Record<'list' | 'listTitle', string>>
  styles?: Partial<Record<'list' | 'listTitle', Record<string, any>>>
  title?: VueNode
  children?: VueNode
  internalPopupClose?: boolean
  eventKey?: string
  warnKey?: boolean
  popupRender?: MenuProps['popupRender']
}

export interface MenuRef {
  focus: (options?: FocusOptions) => void
  list: HTMLUListElement | null
  findItem: (params: { key: string }) => HTMLElement | null
}

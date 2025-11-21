import type { DropdownProps } from '@v-c/dropdown'
import type { FocusEventHandler, KeyboardEventHandler, MouseEventHandler } from '@v-c/util/dist/EventInterface'
import type { VueNode } from '@v-c/util/dist/type'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'

export interface EditableConfig {
  onEdit: (
    type: 'add' | 'remove',
    info: { key?: string, event: MouseEvent | KeyboardEvent },
  ) => void
  showAdd?: boolean
  removeIcon?: VueNode
  addIcon?: VueNode
}

export interface AnimatedConfig {
  inkBar?: boolean
  tabPane?: boolean
  tabPaneMotion?: CSSMotionProps
}

export interface TabsLocale {
  dropdownAriaLabel?: string
  removeAriaLabel?: string
  addAriaLabel?: string
}

export interface AddButtonProps {
  prefixCls: string
  editable?: EditableConfig
  locale?: TabsLocale
  style?: CSSProperties
}

export type OnTabScroll = (info: { direction: 'left' | 'right' | 'top' | 'bottom' }) => void

export type TabBarExtraPosition = 'left' | 'right'

export type TabBarExtraMap = Partial<Record<TabBarExtraPosition, VueNode>>

export type TabBarExtraContent = VueNode | TabBarExtraMap

export interface ExtraContentProps {
  position: TabBarExtraPosition
  prefixCls: string
  extra?: TabBarExtraContent
}

export interface TabPaneProps {
  tab?: VueNode
  className?: string
  style?: CSSProperties
  disabled?: boolean
  children?: VueNode
  forceRender?: boolean
  closable?: boolean
  closeIcon?: VueNode
  icon?: VueNode

  // Pass by TabPaneList
  prefixCls?: string
  tabKey?: string
  id?: string
  animated?: boolean
  active?: boolean
  destroyOnHidden?: boolean
}

export interface Tab extends Omit<TabPaneProps, 'tab'> {
  key: string
  label: VueNode
}

export type moreIcon = VueNode
export type MoreProps = {
  icon?: moreIcon
} & Omit<DropdownProps, 'children'>

export interface OperationNodeProps {
  prefixCls: string
  className?: string
  style?: CSSProperties
  id: string
  tabs: Tab[]
  rtl: boolean
  tabBarGutter?: number
  activeKey: string
  mobile: boolean
  more?: MoreProps
  editable?: EditableConfig
  locale?: TabsLocale
  removeAriaLabel?: string
  onTabClick: (key: string, e: MouseEvent | KeyboardEvent) => void
  tabMoving?: boolean
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  popupClassName?: string
  popupStyle?: CSSProperties
}

export interface TabNodeProps {
  id: string
  prefixCls: string
  tab: Tab
  active: boolean
  focus: boolean
  closable?: boolean
  editable?: EditableConfig
  onClick?: (e: MouseEvent | KeyboardEvent) => void
  onResize?: (width: number, height: number, left: number, top: number) => void
  renderWrapper?: (node: VueNode) => VueNode
  removeAriaLabel?: string
  tabCount: number
  currentPosition: number
  removeIcon?: VueNode
  onKeyDown: KeyboardEventHandler
  onMouseDown: MouseEventHandler
  onMouseUp: MouseEventHandler
  onFocus: FocusEventHandler
  onBlur: FocusEventHandler
  style?: CSSProperties
  className?: string
}

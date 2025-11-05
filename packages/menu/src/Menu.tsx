import type { VueNode } from '@v-c/util/dist/type'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'
import type {
  BuiltinPlacements,
  Components,
  ItemType,
  MenuClickEventHandler,
  MenuMode,
  PopupRender,
  RenderIconType,
  SelectEventHandler,
  TriggerSubMenuAction,
} from './interface.ts'
import type { SemanticName } from './SubMenu'
import { defineComponent } from 'vue'

/**
 * Menu modify after refactor:
 * ## Add
 * - disabled
 *
 * ## Remove
 * - openTransitionName
 * - openAnimation
 * - onDestroy
 * - siderCollapsed: Seems antd do not use this prop (Need test in antd)
 * - collapsedWidth: Seems this logic should be handle by antd Layout.Sider
 */

// optimize for render
const EMPTY_LIST: string[] = []
export interface MenuProps {
  prefixCls?: string
  rootClassName?: string
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  items?: ItemType[]

  disabled?: boolean
  /** @private Disable auto overflow. Pls note the prop name may refactor since we do not final decided. */
  disabledOverflow?: boolean

  /** direction of menu */
  direction?: 'ltr' | 'rtl'

  // Mode
  mode?: MenuMode
  inlineCollapsed?: boolean

  // Open control
  defaultOpenKeys?: string[]
  openKeys?: string[]

  // Active control
  activeKey?: string
  defaultActiveFirst?: boolean

  // Selection
  selectable?: boolean
  multiple?: boolean

  defaultSelectedKeys?: string[]
  selectedKeys?: string[]

  onSelect?: SelectEventHandler
  onDeselect?: SelectEventHandler

  // Level
  inlineIndent?: number

  // Motion
  /** Menu motion define. Use `defaultMotions` if you need config motion of each mode */
  motion?: CSSMotionProps
  /** Default menu motion of each mode */
  defaultMotions?: Partial<{ [key in MenuMode | 'other']: CSSMotionProps }>

  // Popup
  subMenuOpenDelay?: number
  subMenuCloseDelay?: number
  forceSubMenuRender?: boolean
  triggerSubMenuAction?: TriggerSubMenuAction
  builtinPlacements?: BuiltinPlacements

  // Icon
  itemIcon?: RenderIconType
  expandIcon?: RenderIconType
  overflowedIndicator?: VueNode

  /** @private Internal usage. Do not use in your production. */
  overflowedIndicatorPopupClassName?: string

  // >>>>> Function
  getPopupContainer?: (node: HTMLElement) => HTMLElement

  // >>>>> Events
  onClick?: MenuClickEventHandler
  onOpenChange?: (openKeys: string[]) => void

  // >>>>> Internal
  /***
     * @private Only used for `pro-layout`. Do not use in your prod directly
     * and we do not promise any compatibility for this.
     */
  _internalRenderMenuItem?: (
    originNode: any,
    menuItemProps: any,
    stateProps: {
      selected: boolean
    },
  ) => any
  /***
     * @private Only used for `pro-layout`. Do not use in your prod directly
     * and we do not promise any compatibility for this.
     */
  _internalRenderSubMenuItem?: (
    originNode: any,
    subMenuItemProps: any,
    stateProps: {
      selected: boolean
      open: boolean
      active: boolean
      disabled: boolean
    },
  ) => any

  /**
   * @private NEVER! EVER! USE IN PRODUCTION!!!
   * This is a hack API for `antd` to fix `findDOMNode` issue.
   * Not use it! Not accept any PR try to make it as normal API.
   * By zombieJ
   */
  _internalComponents?: Components

  popupRender?: PopupRender
}

interface LegacyMenuProps extends MenuProps {
  openTransitionName?: string
  openAnimation?: string
}

const defaults = {
  prefixCls: 'vc-menu',
  mode: 'vertical',
  subMenuOpenDelay: 0.1,
  subMenuCloseDelay: 0.1,
  selectable: true,
  multiple: false,
  inlineIndent: 24,
  triggerSubMenuAction: 'hover',
  overflowedIndicator: '...',
}

const Menu = defineComponent(
  (props = defaults, { slots, expose, attrs }) => {
    return () => {
      return null
    }
  },
  {
    name: 'VcMenu',
  },
)

export default Menu

import type { InjectionKey } from 'vue'
import type { SubMenuProps } from '..'
import type {
  BuiltinPlacements,
  MenuClickEventHandler,
  MenuMode,
  PopupRender,
  RenderIconType,
  TriggerSubMenuAction,
} from '../interface'
import { defineComponent, inject, provide, ref } from 'vue'
import { menuProps } from '../Menu'

export interface MenuContextProps {
  prefixCls: string
  classNames?: SubMenuProps['classNames']
  styles?: SubMenuProps['styles']
  rootClassName?: string
  openKeys: string[]
  rtl?: boolean

  // Mode
  mode: MenuMode

  // Disabled
  disabled?: boolean
  // Used for overflow only. Prevent hidden node trigger open
  overflowDisabled?: boolean

  // Active
  activeKey: string
  onActive: (key: string) => void
  onInactive: (key: string) => void

  // Selection
  selectedKeys: string[]

  // Level
  inlineIndent: number

  // Motion
  motion?: object
  defaultMotions?: Partial<{ [key in MenuMode | 'other']: any }>

  // Popup
  subMenuOpenDelay: number
  subMenuCloseDelay: number
  forceSubMenuRender?: boolean
  builtinPlacements?: BuiltinPlacements
  triggerSubMenuAction?: TriggerSubMenuAction

  popupRender?: PopupRender

  // Icon
  itemIcon?: RenderIconType
  expandIcon?: RenderIconType

  // Function
  onItemClick: MenuClickEventHandler
  onOpenChange: (key: string, open: boolean) => void
  getPopupContainer: (node: HTMLElement) => HTMLElement
}

export const MenuContext: InjectionKey<MenuContextProps> = Symbol('MenuContext')

export function useProvideMenu(props: MenuContextProps) {
  provide(MenuContext, props)
}

export function useInjectMenu() {
  return inject(MenuContext) || {
    prefixCls: 'vc-menu',
    onActive: () => {},
    openKeys: ref([]),
    // rtl: false,
    //
    // // Mode
    // mode: 'horizontal',
    //
    // // Disabled
    // disabled: false,
    // // Used for overflow only. Prevent hidden node trigger open
    // overflowDisabled: false,
    //
    // // Active
    // activeKey: '',
    // onActive: (key: string) => {},
    // onInactive: (key: string) => {},
    //
    // // Selection
    // selectedKeys: [],
    //
    // // Level
    // inlineIndent: 0,
    //
    // // Motion
    // motion: {},
    // defaultMotions: {},
    //
    // // Popup
    // subMenuOpenDelay: 0,
    // subMenuCloseDelay: 0,
    // forceSubMenuRender: false,
    // builtinPlacements: {},
    // triggerSubMenuAction: {},
    //
    // popupRender: () => {},
    //
    // // Icon
    // itemIcon: () => {},
    // expandIcon: () => {},
    //
    // // Function
    // onItemClick: () => {},
    // onOpenChange: () => {},
    // getPopupContainer: (node: HTMLElement) => HTMLElement,
  }
}

function mergeProps(origin?: MenuContextProps, target: Partial<MenuContextProps>): MenuContextProps {
  const clone = { ...origin }

  Object.keys(target).forEach((key) => {
    const value = target[key]
    if (value !== undefined) {
      clone[key] = value
    }
  })

  return clone
}

export interface InheritableContextProps extends Partial<MenuContextProps> {
  locked?: boolean
}

const InheritableContextProvider = defineComponent({
  name: 'InheritableContextProvider',
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const context = useInjectMenu() || {}

    const inheritableContext = () => mergeProps(context, attrs)
    useProvideMenu(inheritableContext())
    return () => slots.default?.()
  },
})

export default InheritableContextProvider

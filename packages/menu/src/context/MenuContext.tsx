import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { InjectionKey, Ref } from 'vue'
import type {
  BuiltinPlacements,
  MenuClickEventHandler,
  MenuMode,
  PopupRender,
  RenderIconType,
  TriggerSubMenuAction,
} from '../interface.ts'
import type { SubMenuProps } from '../SubMenu'
import omit from '@v-c/util/dist/omit'
import { computed, defineComponent, inject, provide } from 'vue'

export interface MenuContextProps {
  prefixCls: string
  classes?: SubMenuProps['classes']
  styles?: SubMenuProps['styles']
  rootClass?: string
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
  motion?: CSSMotionProps
  defaultMotions?: Partial<{ [key in MenuMode | 'other']: CSSMotionProps }>

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

const MenuContextKey: InjectionKey<Ref<MenuContextProps>> = Symbol('MenuContextKey')

function mergeProps(origin: MenuContextProps, target: Partial<MenuContextProps>): MenuContextProps {
  const clone = { ...origin }

  Object.keys(target).forEach((key) => {
    const value = (target as any)[key]
    if (value !== undefined) {
      (target as any)[key] = value
    }
  })

  return clone
}

export interface InheritableContextProps extends Partial<MenuContextProps> {
  locked?: boolean
}

export function useMenuContext() {
  return inject(MenuContextKey, null)
}

export function useMenuContextProvider(context: Ref<MenuContextProps>) {
  provide(MenuContextKey, context)
}

const InheritableContextProvider = defineComponent<InheritableContextProps>(
  (props, { slots }) => {
    const context = useMenuContext()
    const inheritContext = computed(() => {
      return mergeProps((context?.value ?? {}) as any, omit(props, ['locked']))
    })
    useMenuContextProvider(inheritContext)
    return () => {
      return slots?.default?.()
    }
  },
  {
    inheritAttrs: false,
  },
)

export default InheritableContextProvider

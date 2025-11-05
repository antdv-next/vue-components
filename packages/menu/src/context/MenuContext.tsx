import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { InjectionKey, ShallowRef } from 'vue'
import { defineComponent, inject, provide, shallowRef, watch } from 'vue'
import type {
  BuiltinPlacements,
  MenuClickEventHandler,
  MenuMode,
  RenderIconType,
  TriggerSubMenuAction,
  MenuProps,
} from '../interface'

export interface MenuContextProps {
  prefixCls: string
  classNames?: MenuProps['classNames']
  styles?: MenuProps['styles']
  rootClassName?: string
  openKeys: string[]
  rtl?: boolean
  mode: MenuMode
  disabled?: boolean
  overflowDisabled?: boolean
  activeKey: string
  onActive: (key: string) => void
  onInactive: (key: string) => void
  selectedKeys: string[]
  inlineIndent: number
  motion?: CSSMotionProps
  defaultMotions?: Partial<Record<MenuMode | 'other', CSSMotionProps>>
  subMenuOpenDelay: number
  subMenuCloseDelay: number
  forceSubMenuRender?: boolean
  builtinPlacements?: BuiltinPlacements
  triggerSubMenuAction?: TriggerSubMenuAction
  popupRender?: MenuProps['popupRender']
  itemIcon?: RenderIconType
  expandIcon?: RenderIconType
  onItemClick: MenuClickEventHandler
  onOpenChange: (key: string, open: boolean) => void
  getPopupContainer: (node: HTMLElement) => HTMLElement
}

const contextPropKeys: (keyof MenuContextProps)[] = [
  'prefixCls',
  'classNames',
  'styles',
  'rootClassName',
  'openKeys',
  'rtl',
  'mode',
  'disabled',
  'overflowDisabled',
  'activeKey',
  'onActive',
  'onInactive',
  'selectedKeys',
  'inlineIndent',
  'motion',
  'defaultMotions',
  'subMenuOpenDelay',
  'subMenuCloseDelay',
  'forceSubMenuRender',
  'builtinPlacements',
  'triggerSubMenuAction',
  'popupRender',
  'itemIcon',
  'expandIcon',
  'onItemClick',
  'onOpenChange',
  'getPopupContainer',
]

type InheritableContextProps = Partial<MenuContextProps> & { locked?: boolean }

const MenuContextKey: InjectionKey<ShallowRef<MenuContextProps> | null> = Symbol('MenuContext')

export function provideMenuContext(value: MenuContextProps) {
  const context = shallowRef<MenuContextProps>({ ...value })
  provide(MenuContextKey, context)
  return context
}

export function useMenuContext() {
  return inject(MenuContextKey, null)
}

export default defineComponent({
  name: 'MenuContextProvider',
  props: contextPropKeys.reduce((acc, key) => {
    acc[key] = { type: null as any }
    return acc
  }, { locked: Boolean } as Record<string, any>),
  setup(props: InheritableContextProps, { slots }) {
    const parent = inject(MenuContextKey, null)

    const buildContext = () => {
      const origin = parent?.value
      const clone = origin ? { ...origin } : ({} as MenuContextProps)
      contextPropKeys.forEach((key) => {
        const val = (props as any)[key]
        if (val !== undefined) {
          (clone as any)[key] = val
        }
      })
      return clone
    }

    const contextRef = shallowRef<MenuContextProps>(buildContext())
    provide(MenuContextKey, contextRef)

    watch(
      () => [
        parent?.value,
        ...contextPropKeys.map(key => (props as any)[key]),
        props.locked,
      ],
      () => {
        if (!props.locked) {
          contextRef.value = buildContext()
        }
      },
      { immediate: true, deep: true },
    )

    return () => slots.default?.()
  },
})

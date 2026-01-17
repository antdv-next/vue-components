import type { PortalProps } from '@v-c/portal'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties, InjectionKey, Ref } from 'vue'
import type { TriggerProps } from './index'
import type {
  AlignType,
  ArrowTypeOuter,
  BuildInPlacements,
} from './interface'
import { computed, defineComponent, inject, provide } from 'vue'
// ===================== Nest =====================
export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement | null) => void
}

const TriggerContextKey: InjectionKey<Ref<TriggerContextProps>> = Symbol('TriggerContextKey')

export function useTriggerContext() {
  return inject(TriggerContextKey, undefined)
}

export const TriggerContextProvider = defineComponent(
  (props, { slots }) => {
    provide(TriggerContextKey, computed(() => props))
    return () => {
      return slots?.default?.()
    }
  },
  {
    props: ['registerSubPopup'],
  },
)

// ==================== Unique ====================
export interface UniqueShowOptions {
  id: string
  popup: TriggerProps['popup']
  target: HTMLElement
  delay: number
  prefixCls?: string
  popupClassName?: string
  uniqueContainerClassName?: string
  uniqueContainerStyle?: CSSProperties
  popupStyle?: CSSProperties
  popupPlacement?: string
  builtinPlacements?: BuildInPlacements
  popupAlign?: AlignType
  zIndex?: number
  mask?: boolean
  maskClosable?: boolean
  popupMotion?: CSSMotionProps
  maskMotion?: CSSMotionProps
  arrow?: ArrowTypeOuter
  getPopupContainer?: TriggerProps['getPopupContainer']
  getPopupClassNameFromAlign?: (align: AlignType) => string
  onEsc?: PortalProps['onEsc']
}

export interface UniqueContextProps {
  show: (options: UniqueShowOptions, isOpen: () => boolean) => void
  hide: (delay: number) => void
}

export const UniqueContextKey: InjectionKey<UniqueContextProps> = Symbol('UniqueContextKey')

export function useUniqueContext() {
  return inject(UniqueContextKey, undefined)
}

export const UniqueContextProvider = defineComponent(
  (props, { slots }) => {
    provide(UniqueContextKey, props)
    return () => {
      return slots?.default?.()
    }
  },
  {
    props: ['show', 'hide'],
  },
)

import type { TriggerProps } from '@v-c/trigger'
import type { VueNode } from '@v-c/util/dist/type'
import type { AriaAttributes, CSSProperties, Ref } from 'vue'
import type { Gap } from './hooks/useTarget.ts'
import type { PlacementType } from './placements'
import type { DefaultPanelProps } from './TourStep/DefaultPanel.tsx'

export type SemanticName = 'section'
  | 'footer'
  | 'actions'
  | 'header'
  | 'title'
  | 'description'
  | 'mask'

export type HTMLAriaDataAttributes = AriaAttributes & {
  [key: `data-${string}`]: unknown
  role?: string
}
export interface TourStepInfo {
  arrow?: boolean | { pointAtCenter: boolean }
  target?: Ref<HTMLElement | null | undefined> | HTMLElement | null | (() => HTMLElement | null | undefined)
  title: VueNode
  description?: VueNode
  placement?: PlacementType
  className?: string
  style?: CSSProperties
  mask?:
    | boolean
    | {
      style?: CSSProperties
      // to fill mask color, e.g. rgba(80,0,0,0.5)
      color?: string
    }

  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions
  closeIcon?: VueNode
  closable?: boolean | ({ closeIcon?: VueNode } & HTMLAriaDataAttributes)
}

export interface TourStepProps extends TourStepInfo {
  prefixCls?: string
  total?: number
  current?: number
  onClose?: () => void
  onFinish?: () => void
  renderPanel?: (step: DefaultPanelProps, current: number) => VueNode
  onPrev?: () => void
  onNext?: () => void
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
}

export interface TourProps extends Pick<TriggerProps, 'onPopupAlign'> {
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  className?: string
  style?: CSSProperties
  steps?: TourStepInfo[]
  open?: boolean
  defaultOpen?: boolean
  defaultCurrent?: number
  current?: number
  onChange?: (current: number) => void
  onClose?: (current: number) => void
  onFinish?: () => void
  closeIcon?: TourStepProps['closeIcon']
  closable?: TourStepProps['closable']

  mask?:
    | boolean
    | {
      style?: CSSProperties
      // to fill mask color, e.g. rgba(80,0,0,0.5)
      color?: string
    }
  arrow?: boolean | { pointAtCenter: boolean }
  rootClassName?: string
  placement?: PlacementType
  prefixCls?: string
  renderPanel?: (props: DefaultPanelProps, current: number) => VueNode
  gap?: Gap
  animated?: boolean | { placeholder: boolean }
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions
  zIndex?: number
  getPopupContainer?: TriggerProps['getPopupContainer'] | false
  builtinPlacements?:
    | TriggerProps['builtinPlacements']
    | ((config?: {
      arrowPointAtCenter?: boolean
    }) => TriggerProps['builtinPlacements'])
  disabledInteraction?: boolean
  keyboard?: boolean
}

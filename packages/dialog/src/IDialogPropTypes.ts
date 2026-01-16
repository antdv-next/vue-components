import type { GetContainer } from '@v-c/util/dist/PortalWrapper'
import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'

export type SemanticName = 'header' | 'body' | 'footer' | 'container' | 'title' | 'wrapper' | 'mask'

export type ModalClassNames = Partial<Record<SemanticName, string>>

export type ModalStyles = Partial<Record<SemanticName, CSSProperties>>

export interface IDialogPropTypes {
  className?: string
  keyboard?: boolean
  style?: CSSProperties
  rootStyle?: CSSProperties
  mask?: boolean
  children?: VueNode
  afterClose?: () => any
  afterOpenChange?: (open: boolean) => void
  onClose?: (e: any) => any
  closable?: boolean | ({ closeIcon?: VueNode, disabled?: boolean } & Record<string, any>)
  maskClosable?: boolean
  visible?: boolean
  destroyOnHidden?: boolean
  mousePosition?: {
    x: number
    y: number
  } | null
  title?: VueNode
  footer?: VueNode
  transitionName?: string
  maskTransitionName?: string
  animation?: any
  maskAnimation?: any
  wrapStyle?: Record<string, any>
  bodyStyle?: Record<string, any>
  maskStyle?: Record<string, any>
  prefixCls?: string
  wrapClassName?: string
  width?: string | number
  height?: string | number
  zIndex?: number
  bodyProps?: any
  maskProps?: any
  rootClassName?: string
  classNames?: ModalClassNames
  styles?: ModalStyles
  wrapProps?: any
  getContainer?: GetContainer | false
  closeIcon?: VueNode
  modalRender?: (node: VueNode) => VueNode
  forceRender?: boolean
  // https://github.com/ant-design/ant-design/issues/19771
  // https://github.com/react-component/dialog/issues/95
  focusTriggerAfterClose?: boolean
  focusTrap?: boolean

  // Refs
  panelRef?: any
}

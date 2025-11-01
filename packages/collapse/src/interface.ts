import type { Key, VueNode } from '@v-c/util/dist/type'
import type {
  CSSProperties,
  PropType,
  Ref,
  TransitionProps,
  VNode,
} from 'vue'

export type CollapsibleType = 'header' | 'icon' | 'disabled'

export type SemanticName = 'header' | 'title' | 'body' | 'icon'

export function generatorCollapsePanelProps() {
  return {
    id: String,
    header: [String, Object] as PropType<string | VNode>,
    prefixCls: String,
    headerClass: String,
    showArrow: {
      type: Boolean as PropType<boolean | undefined>,
      default: true,
    },
    className: String,
    classNames: {
      type: Object as PropType<Partial<Record<SemanticName, string>>>,
      default: () => ({}),
    },
    style: Object as PropType<Record<string, string>>,
    styles: {
      type: Object as PropType<Partial<Record<SemanticName, CSSProperties>>>,
      default: () => ({}),
    },
    isActive: Boolean,
    openMotion: Object as PropType<Partial<TransitionProps>>,
    destroyInactivePanel: Boolean as PropType<boolean | undefined>,
    accordion: Boolean,
    forceRender: Boolean as PropType<boolean | undefined>,
    onItemClick: Function as PropType<(props: Key) => void>,
    extra: [String, Object] as PropType<string | VueNode>,
    panelKey: [String, Number],
    collapsible: String as PropType<CollapsibleType>,
    expandIcon: Function as PropType<(props: any) => VueNode>,
    role: String,
    children: [Object, String] as PropType<VueNode | string>,
  }
}

export interface CollapsePanelProps {
  id?: string
  header?: VueNode
  prefixCls?: string
  headerClass?: string
  showArrow?: boolean
  className?: string
  classNames?: Partial<Record<SemanticName, string>>
  style?: object
  styles?: Partial<Record<SemanticName, CSSProperties>>
  isActive?: boolean
  openMotion?: TransitionProps
  destroyOnHidden?: boolean
  accordion?: boolean
  forceRender?: boolean
  extra?: VueNode
  onItemClick?: (panelKey: Key) => void
  expandIcon?: (props: object) => any
  panelKey?: Key
  role?: string
  collapsible?: CollapsibleType
  children?: VueNode | string
}

export interface ItemType
  extends Omit<
    CollapsePanelProps,
    | 'header' // alias of label
    | 'prefixCls'
    | 'panelKey' // alias of key
    | 'isActive'
    | 'accordion'
    | 'openMotion'
    | 'expandIcon'
  > {
  key?: CollapsePanelProps['panelKey']
  label?: CollapsePanelProps['header']
  children?: VueNode
  ref?: Ref<HTMLDivElement>
}

export function generatorCollapseProps() {
  return {
    prefixCls: String,
    activeKey: [String, Number, Array] as PropType<Key | Key[]>,
    defaultActiveKey: [String, Number, Array] as PropType<Key | Key[]>,
    openMotion: Object,
    onChange: Function as PropType<(key: Key[]) => void>,
    accordion: Boolean,
    className: String,
    classNames: Object as PropType<Partial<Record<SemanticName, string>>>,
    style: Object,
    styles: Object as PropType<Partial<Record<SemanticName, CSSProperties>>>,
    destroyInactivePanel: Boolean,
    expandIcon: Function as PropType<(props: any) => VueNode>,
    collapsible: String as PropType<CollapsibleType>,
    items: Array as PropType<ItemType[]>,
  }
}

export interface CollapseProps {
  prefixCls?: string
  activeKey?: Key | Key[]
  defaultActiveKey?: Key | Key[]
  openMotion?: TransitionProps
  onChange?: (key: Key[]) => void
  accordion?: boolean
  className?: string
  style?: object
  destroyOnHidden?: boolean
  expandIcon?: (props: object) => any
  collapsible?: CollapsibleType
  /**
   * Collapse items content
   * @since 3.6.0
   */
  items?: ItemType[]
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
}
export function generatorCollapsePanelContentProps() {
  return {
    isActive: Boolean,
    prefixCls: String,
    className: String,
    classNames: Object as PropType<{ header?: string, body?: string }>,
    style: Object as PropType<Record<string, string>>,
    styles: Object as PropType<{
      header?: CSSProperties
      body?: CSSProperties
    }>,
    role: String,
    forceRender: Boolean,
  }
}

export type {
  Key,
}

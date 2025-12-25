/**
 * ColumnType which applied in antd: https://ant.design/components/table-cn/#Column
 * - defaultSortOrder
 * - filterDropdown
 * - filterDropdownVisible
 * - filtered
 * - filteredValue
 * - filterIcon
 * - filterMultiple
 * - filters
 * - sorter
 * - sortOrder
 * - sortDirections
 * - onFilter
 * - onFilterDropdownVisibleChange
 */

import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, Ref, TdHTMLAttributes } from 'vue'
import type { DeepNamePath } from './namePathType'

export type Key = string | number

/**
 * Use `start` or `end` instead. `left` or `right` is deprecated.
 */
export type FixedType = 'start' | 'end' | 'left' | 'right' | boolean

export type DefaultRecordType = Record<string, any>

export type TableLayout = 'auto' | 'fixed'

export type SemanticName = 'section' | 'title' | 'footer' | 'content'

export type ComponentsSemantic = 'wrapper' | 'cell' | 'row'

export type TableClassNames = Partial<Record<SemanticName, string>> & {
  body?: Partial<Record<ComponentsSemantic, string>>
  header?: Partial<Record<ComponentsSemantic, string>>
}

export type TableStyles = Partial<Record<SemanticName, CSSProperties>> & {
  body?: Partial<Record<ComponentsSemantic, CSSProperties>>
  header?: Partial<Record<ComponentsSemantic, CSSProperties>>
}

export type ScrollConfig = {
  /** The index of the row to scroll to */
  index?: number
  /** The key of the row to scroll to */
  key?: Key
  /** The absolute scroll position from top */
  top?: number
  /**
   * Additional offset in pixels to apply to the scroll position.
   * Only effective when using `key` or `index` mode.
   */
  offset?: number
}

export type Reference = {
  nativeElement: HTMLDivElement
  scrollTo: (config: ScrollConfig) => void
}

// ==================== Row =====================
export type RowClassName<RecordType> = (
  record: RecordType,
  index: number,
  indent: number,
) => string

export type TransformCellText<RecordType> = (opt: {
  text: any
  column: ColumnType<RecordType>
  record: any
  index: number
}) => any

// =================== Column ===================
export interface CellType<RecordType = DefaultRecordType> {
  key?: Key
  className?: string
  class?: string
  style?: CSSProperties
  children?: VueNode
  column?: ColumnsType<RecordType>[number]
  colSpan?: number
  rowSpan?: number

  /** Only used for table header */
  hasSubColumns?: boolean
  colStart?: number
  colEnd?: number
}

export interface RenderedCell<RecordType> {
  props?: CellType<RecordType>
  children?: VueNode
}

export type Direction = 'ltr' | 'rtl'

// SpecialString will be removed in antd@6
export type SpecialString<T> = T | (string & NonNullable<unknown>)

export type DataIndex<T = any> =
  | DeepNamePath<T>
  | SpecialString<T>
  | number
  | (SpecialString<T> | number)[]

export type CellEllipsisType = { showTitle?: boolean } | boolean

export type ColScopeType = 'col' | 'colgroup'

export type RowScopeType = 'row' | 'rowgroup'

export type ScopeType = ColScopeType | RowScopeType

interface ColumnSharedType<RecordType> {
  title?: VueNode
  key?: Key
  className?: string
  class?: string
  hidden?: boolean
  fixed?: FixedType
  onHeaderCell?: GetComponentProps<ColumnsType<RecordType>[number]>
  /** @deprecated Please use `onHeaderCell` instead */
  customHeaderCell?: GetComponentProps<ColumnsType<RecordType>[number]>
  ellipsis?: CellEllipsisType
  align?: AlignType
  rowScope?: RowScopeType
  customFilterDropdown?: boolean
  /** @deprecated Please use slots instead */
  slots?: {
    filterIcon?: string
    filterDropdown?: string
    customRender?: string
    title?: string
  }

  /**
   * @private Internal usage.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  __originColumn__?: any
}

export interface ColumnGroupType<RecordType> extends ColumnSharedType<RecordType> {
  children: ColumnsType<RecordType>
}

export type AlignType = 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent'

export interface ColumnType<RecordType> extends ColumnSharedType<RecordType> {
  colSpan?: number
  dataIndex?: DataIndex<RecordType>
  render?: (
    value: any,
    record: RecordType,
    index: number,
  ) => VueNode | RenderedCell<RecordType>
  customRender?: (opt: {
    value: any
    text: any
    record: RecordType
    index: number
    renderIndex: number
    column: ColumnType<RecordType>
  }) => VueNode | RenderedCell<RecordType>
  shouldCellUpdate?: (record: RecordType, prevRecord: RecordType) => boolean
  rowSpan?: number
  width?: number | string
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
  onCell?: GetComponentProps<RecordType>
  /** @deprecated Please use `onCell` instead */
  customCell?: GetComponentProps<RecordType>
  /** @deprecated Please use `onCell` instead */
  onCellClick?: (record: RecordType, e: MouseEvent) => void
}

export type ColumnsType<RecordType = unknown> = readonly (
  | ColumnGroupType<RecordType>
  | ColumnType<RecordType>
)[]

export type GetRowKey<RecordType> = (record: RecordType, index?: number) => Key

// ================= Fix Column =================
export interface StickyOffsets {
  start: readonly number[]
  end: readonly number[]
  widths: readonly number[]
  isSticky?: boolean
  // Legacy alias for internal left/right usage
  left?: readonly number[]
  right?: readonly number[]
}

export type AdditionalProps = TdHTMLAttributes & {
  colSpan?: number
  rowSpan?: number
  scope?: ScopeType
  className?: string
}

// ================= Customized =================
export type GetComponentProps<DataType> = (
  data: DataType,
  index?: number,
  column?: ColumnType<any>,
) => AdditionalProps

export type CustomizeComponent = any

export type OnCustomizeScroll = (info: {
  currentTarget?: HTMLElement
  scrollLeft?: number
}) => void

export type CustomizeScrollBody<RecordType> = (
  data: readonly RecordType[],
  info: {
    scrollbarSize: number
    ref: Ref<{ scrollLeft: number; scrollTo?: (scrollConfig: ScrollConfig) => void }>
    onScroll: OnCustomizeScroll
  },
) => VueNode

export interface TableComponents<RecordType> {
  table?: CustomizeComponent
  header?: {
    table?: CustomizeComponent
    wrapper?: CustomizeComponent
    row?: CustomizeComponent
    cell?: CustomizeComponent
  }
  body?:
    | CustomizeScrollBody<RecordType>
    | {
        wrapper?: CustomizeComponent
        row?: CustomizeComponent
        cell?: CustomizeComponent
      }
}

export type GetComponent = (
  path: readonly string[],
  defaultComponent?: CustomizeComponent,
) => CustomizeComponent

// =================== Expand ===================
export type ExpandableType = false | 'row' | 'nest'

export interface LegacyExpandableProps<RecordType> {
  /** @deprecated Use `expandable.expandedRowKeys` instead */
  expandedRowKeys?: Key[]
  /** @deprecated Use `expandable.defaultExpandedRowKeys` instead */
  defaultExpandedRowKeys?: Key[]
  /** @deprecated Use `expandable.expandedRowRender` instead */
  expandedRowRender?: ExpandedRowRender<RecordType>
  /** @deprecated Use `expandable.expandRowByClick` instead */
  expandRowByClick?: boolean
  /** @deprecated Use `expandable.expandIcon` instead */
  expandIcon?: RenderExpandIcon<RecordType>
  /** @deprecated Use `expandable.onExpand` instead */
  onExpand?: (expanded: boolean, record: RecordType) => void
  /** @deprecated Use `expandable.onExpandedRowsChange` instead */
  onExpandedRowsChange?: (expandedKeys: Key[]) => void
  /** @deprecated Use `expandable.defaultExpandAllRows` instead */
  defaultExpandAllRows?: boolean
  /** @deprecated Use `expandable.indentSize` instead */
  indentSize?: number
  /** @deprecated Use `expandable.expandIconColumnIndex` instead */
  expandIconColumnIndex?: number
  /** @deprecated Use `expandable.expandedRowClassName` instead */
  expandedRowClassName?: string | RowClassName<RecordType>
  /** @deprecated Use `expandable.childrenColumnName` instead */
  childrenColumnName?: string
  title?: PanelRender<RecordType>
}

export type ExpandedRowRender<ValueType> =
  | ((record: ValueType, index: number, indent: number, expanded: boolean) => VueNode)
  | ((opt: { record: ValueType; index: number; indent: number; expanded: boolean }) => VueNode)

export interface RenderExpandIconProps<RecordType> {
  prefixCls: string
  expanded: boolean
  record: RecordType
  expandable: boolean
  onExpand: TriggerEventHandler<RecordType>
}

export type RenderExpandIcon<RecordType> = (props: RenderExpandIconProps<RecordType>) => VueNode

export interface ExpandableConfig<RecordType> {
  expandedRowKeys?: readonly Key[]
  defaultExpandedRowKeys?: readonly Key[]
  expandedRowRender?: ExpandedRowRender<RecordType>
  columnTitle?: VueNode
  expandRowByClick?: boolean
  expandIcon?: RenderExpandIcon<RecordType>
  onExpand?: (expanded: boolean, record: RecordType) => void
  onExpandedRowsChange?: (expandedKeys: readonly Key[]) => void
  defaultExpandAllRows?: boolean
  indentSize?: number
  /** @deprecated Please use `EXPAND_COLUMN` in `columns` directly */
  expandIconColumnIndex?: number
  showExpandColumn?: boolean
  expandedRowClassName?: string | RowClassName<RecordType>
  childrenColumnName?: string
  rowExpandable?: (record: RecordType) => boolean
  columnWidth?: number | string
  fixed?: FixedType
  expandedRowOffset?: number
}

// =================== Render ===================
export type PanelRender<RecordType> = (data: readonly RecordType[]) => VueNode

// =================== Events ===================
export type TriggerEventHandler<RecordType> = (record: RecordType, event: MouseEvent) => void

// =================== Sticky ===================
export interface TableSticky {
  offsetHeader?: number
  offsetSummary?: number
  offsetScroll?: number
  getContainer?: () => Window | HTMLElement
}
